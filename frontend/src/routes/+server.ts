

import weaviate, { ApiKey, type WeaviateClient } from 'weaviate-ts-client';
import { WeaviateStore } from "./weaviate";
import { RetrievalQAChain, loadQARefineChain, loadQAMapReduceChain, loadQAStuffChain, loadSummarizationChain } from "langchain/chains";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { BoogaLLM } from './langchain_booga';
import { OpenAI } from 'langchain/llms/openai';

import { PromptTemplate } from "langchain/prompts";
import { SimpleSequentialChain, LLMChain } from "langchain/chains";


import { WEAVIATE_URI } from "$env/static/private"
import { OPENAI_KEY } from "$env/static/private"

import { CallbackManager } from "langchain/callbacks";

import { json, text, error } from '@sveltejs/kit';
import { CiteStuffDocumentsChain } from './doc_chain';

import { pb } from '$lib/pocketbase';

const client: WeaviateClient = weaviate.client({
    scheme: 'http',
    host: WEAVIATE_URI,  // Replace with your endpoint
    headers: {},  // Replace with your inference API key
});

const run = async (query: string, oai_key?: string): Promise<ReadableStream> => {
	let docs: any = undefined;
    const store = await WeaviateStore.fromExistingIndex(new FakeEmbeddings(), {
        client,
        indexName: "MedRef",
        textKey: "corpus",
        inputKey: "corpus",
        metadataKeys: ["title", "page", "url"]
    });




    // Initialize the LLM to use to answer the question.
    //let model = new BoogaLLM("http://127.0.0.1:5000/", {max_new_tokens: 1000, prompt_prefix: "", prompt_suffix: ""});
    //let model = new BoogaLLM("https://33x5s1uzc7f1f6-5000.proxy.runpod.net/", {max_new_tokens: 1000, prompt_prefix: "USER:", prompt_suffix: "ASSISTANT:"});

    let doc_query_model = new OpenAI({modelName: "gpt-3.5-turbo", temperature: 0.1, maxTokens: 100, openAIApiKey: oai_key || OPENAI_KEY})
    const doc_query_template = "Summarize the topic of the following question in 5-10 words. Respond with only the keywords:\n#Question:\n{question}?";
    const doc_query_prompt = new PromptTemplate({ template: doc_query_template, inputVariables: ["question"] });
    const doc_query_chain = new LLMChain({ llm: doc_query_model, prompt: doc_query_prompt })
    
    const doc_search_query = (await doc_query_chain.call({question: query}))["text"]
    console.log(`Searching for docs using the query:\n"${doc_search_query}"`)

    docs = await store.similaritySearch(doc_search_query, 10).catch((e) => {
        console.warn("Error: Unable to search weaviate:", e)
        return undefined
    })
    if (docs == undefined) {
        return Promise.reject("Database error, unable to search documents")
    }

    docs = docs.map((x) => x[0])

    let run_ai_stream = async (controller: ReadableStreamDefaultController) => {
        controller.enqueue(JSON.stringify({event: "docs", data: JSON.stringify(docs)}) + '\u2063')
        let model = new OpenAI({ 
            modelName: "gpt-3.5-turbo-16k", temperature: 0.1, maxTokens: 1000, 
            openAIApiKey: oai_key || OPENAI_KEY,
            streaming: true,
            callbackManager: CallbackManager.fromHandlers({
                async handleLLMNewToken(token: string) {
                    try {
                        controller.enqueue(JSON.stringify({
                            event: "token",
                            data: token
                        }) + '\u2063')    
                    } catch (e) {
                        console.warn("Failed to queue token:", e)
                    }
                },
                async handleLLMEnd(output) {
                    //TODO: Fix this hack. I don't know how to wait until the controller is done sending/host receiving data and when to close connection. Instead just added 1s delayss
                    setTimeout(() => {
                        try {
                            controller.close()
                        } catch (e) {
                            console.warn("Failed to close stream controller:", e)
                        }
                    }, 1000)
                    //console.log("End of stream.", output);
                },
            }),    
        })

        /* Custom QA chain */
        const docquery_stuff_qa_chain_gen = (llm: any, params: any) => {
            const verbose = params.verbose || false;
            const prompt = new PromptTemplate({
                template: "# Question:\n{question}.\n\nUse the following documents to answer this question, explain in detail but don't be repetitive. Include citations to these documents to back up every claim you make, using the form [[1]](#citation-1) in order to help maintain accuracy. If you do not have a citation for a claim you must cite it as [Uncited]. If you do not know the answer, you must say that you do not know. Do not try to make up an answer.\n\n# Documents\n{context}\n\n# Answer:",
                inputVariables: ["context", "question"],
            });        
            const llmChain = new LLMChain({ prompt, llm, verbose });
            const doc_chain = new CiteStuffDocumentsChain({ llmChain, verbose });
            return doc_chain;    
        }

        const chain = docquery_stuff_qa_chain_gen(model, {verbose: false});
        const res = await chain.call({
            input_documents: docs,
            question: query,
        });
        /*pb.collection("query").create({
            query, docs, response: res.text
        })*/
        console.log(await model.getNumTokens(res.text))
        controller.enqueue(JSON.stringify({
            event: "n_tokens",
            data: await model.getNumTokens(res.text)
        }) + '\u2063')
    }

    let output_stream = new ReadableStream({
        start(controller) {
			run_ai_stream(controller)
		},
		cancel() {
			//clearInterval(timer);
		}
    })

    return output_stream
};

export async function POST({ request, cookies }) {
    pb.authStore.loadFromCookie(request.headers.get('cookie') || '')
    // Check cookies to ensure user logged in
    if (!pb.authStore || !pb.authStore.isValid || !pb.authStore.model) {
        throw error(400, "Cannot query without valid login")
    }
    let oai_key = (pb.authStore.model.oai_key && pb.authStore.model.oai_key.trim != "") ? pb.authStore.model.oai_key : undefined
    // If user not using their own OpenAI API key...
    if (!oai_key) {
        // Deduct coins for the query 
        const query_cost = 1;
        if (pb.authStore.model.coins - query_cost < 0) {
            throw error(400, "Insufficient coins, query request denied")
        }
        pb.authStore.model.coins = pb.authStore.model.coins - query_cost
        pb.collection("users").update(pb.authStore.model.id, {
            coins: pb.authStore.model.coins - query_cost
        })
        pb.authStore.save(pb.authStore.token, pb.authStore.model)
    }
    //Run query and respond with server sent event
    const { query } = await request.json();
    return await run(query, oai_key).then((output_stream) => {
        return new Response(output_stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });
    }).catch((e) => {
        throw error(500, e)
    })    
}
<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown'
	import PDFViewer from './PDFView.svelte';
	import CopyToClipboard from "svelte-copy-to-clipboard";
	import {default_query_list} from "./example_queries";
	import Icon from '@iconify/svelte';
	import { toast } from '@zerodevx/svelte-toast'
	import { pb, uaccount } from '$lib/pocketbase';

	interface Source {
		pageContent: string,
		metadata: {
			corpus: string,
			title: string,
			page: number,
			url: string,
		}
	}
	type SourceList = Source[];


	import { onMount } from 'svelte';

	import * as fs from "fs";

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { debounce } from '$lib/debounce';
	import { shortcut, type ShortcutParameters } from '@svelte-put/shortcut';
	

	const regen_default_query = () => default_query_list[Math.floor(Math.random() * default_query_list.length)];

	let query = decodeURIComponent($page.url.searchParams.get('query') || regen_default_query());


	//let query = "What are the three best tests to diagnose cardiac syncope? Include sensitivity and specificity values for each test you compared."
	//let query = user_query || "What are the treatment options for melanoma with brain metastasis"
	let query_result: string | undefined = ""
	let docs: SourceList = []
	let search_start_time = Date.now();
	let search_time = 0;
	let search_updater: NodeJS.Timeout;

	let pdf_page = 0;
	let pdf_url = "";

	const start_search_timer = () => {
		search_start_time = Date.now()
		search_updater = setInterval(() => {
			search_time = Date.now() - search_start_time;
		}, 150)
	}
	
	const stop_search_timer = () => {
		clearInterval(search_updater);
	}


	let filter_unique_docs = (docs: SourceList, fields: string[]): SourceList => {
		const uniqueDataMap: Record<string, number> = {};
		const uniqueData = [];
		docs.sort((a, b) => {
			return ((!a.metadata.url) ? 1 : 0) - ((!b.metadata.url) ? 1 : 0) 
		})
		for(let index = 0; index < docs.length; index++) {
			const value = docs[index];
			const key = fields.map(field => (value.metadata as any)[field]).join('-');
			
			if(uniqueDataMap[key] === undefined) {
				uniqueDataMap[key] = index;
				uniqueData.push(value);
			}
		}

		return uniqueData;
	}
	
	let linkgen = (source: Source): string => {
		let base_url = "https://pubmed.ncbi.nlm.nih.gov/?term="
		let url = base_url + encodeURIComponent(source.metadata.title)
		return url
	}

	let loading_query_result = false;
	let accordion_i = -1;
	let result_citation_list: number[] = []
	let hide_unused_docs = true;

	let hide_docs = () => {
		let match_iter = query_result?.matchAll(/\(#citation-(\d+)\)/gi)
		result_citation_list = [...match_iter!].map((citation) => {
			return parseInt(citation[1])
		})
	}

	function makeJsonDecoder() {
		return new TransformStream({
			start(controller) {
			controller.buf = ''
			controller.pos = 0
			},
			transform(chunk, controller) {
			controller.buf += chunk
			while (controller.pos < controller.buf.length) {
				if (controller.buf[controller.pos] == '\u2063') {
				const line = controller.buf.substring(0, controller.pos)
				controller.enqueue(JSON.parse(line))
				controller.buf = controller.buf.substring(controller.pos + 1)
				controller.pos = 0
				} else {
				++controller.pos
				}
			}
			}
		})
	}

	function makeWriteableEventStream(eventTarget) {
		return new WritableStream({
			start(controller) {
				eventTarget.dispatchEvent(new Event('start'))
			},
			write(message, controller) {
				eventTarget.dispatchEvent(
					new MessageEvent(
					message.event,
					{ data: message.data }
					)
				)
			},
			close(controller) {
				eventTarget.dispatchEvent(new CloseEvent('close'))
			},
			abort(reason) {
				eventTarget.dispatchEvent(new CloseEvent('abort', { reason }))
			}
		})
	}

	let query_doc = async () => {
		docs = [];
		query_result = undefined
		loading_query_result = true;
		close_pdf();
		start_search_timer()

		const eventTarget = new EventTarget()
		const jsonDecoder = makeJsonDecoder()
		const eventStream = makeWriteableEventStream(eventTarget)
		
		eventTarget.addEventListener('token', event => {
			if (query_result == undefined) query_result = ""
			query_result! += event.data
		})
		eventTarget.addEventListener('n_tokens', async (event) => {
			console.log("Response contained n_tokens:", event.data)
			// Refreshes coin count
			await pb.collection('users').authRefresh()
			await pb.collection("query").create({
				query, docs, response: query_result, uid: $uaccount!.id
			})
		})
		eventTarget.addEventListener('docs', event => {
			console.log("JSONDATA DOCS!", JSON.parse(event.data))
			docs = JSON.parse(event.data).filter((x) => x.metadata);
		})
		eventTarget.addEventListener("close", () => {
			loading_query_result = false
			hide_docs()
		})

		await fetch("/", {
			method: "POST",
			body: JSON.stringify({ query }),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(async (resp) => {
			if (!resp.ok) {
				return Promise.reject(`### Error ${resp.status} - ${resp.statusText}\n${(await resp.json()).message}, please try again later...`)
			}
			const reader = resp.body!.pipeThrough(new TextDecoderStream()).pipeThrough(jsonDecoder).pipeTo(eventStream)
		}).catch((e) => {
			query_result = e
			loading_query_result = false
		})
	}

	let url_update_debounce: NodeJS.Timeout;

	const url_query_push = (values: Record<string, string>, debounce_ms=1500) => {
		clearTimeout(url_update_debounce)
		url_update_debounce = setTimeout(() => {
			const url = new URL(window.location.toString());
			for (let [k, v] of Object.entries(values)) {
				if (!!v) {
				url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v));
				} else {
				url.searchParams.delete(k);
				}
			}
			history.pushState({}, '', url);
		}, debounce_ms)
	};
	const url_query_replace = (values: Record<string, string>, debounce_ms=1500) => {
		clearTimeout(url_update_debounce)
		url_update_debounce = setTimeout(() => {
			const url = new URL(window.location.toString());
			for (let [k, v] of Object.entries(values)) {
				if (!!v) {
				url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v));
				} else {
				url.searchParams.delete(k);
				}
			}
			history.replaceState({}, '', url);
		}, debounce_ms)
	};

	const title_to_pdf_lookup: Record<string, string> = {
		"Harrison's Principles of Internal Medicine, Twenty-First Edition (Vol1 & Vol2)": "/raw_data/textbook/harrisons.pdf"
	}

	const open_pdf = (url: string, page: number) => {
		pdf_url = url;
		pdf_page = page;
		setTimeout(() => {
			document.querySelector("#pdfview-container canvas")?.scrollIntoView({
			behavior: 'smooth', // 'auto' or 'smooth'
			block: 'start',     // 'start', 'end', 'center', or 'nearest'
			inline: 'nearest'   // 'start', 'end', 'center', or 'nearest'
		}, 500);

		})
	}
	const close_pdf = () => {
		pdf_url = ""
		pdf_page = 0
	}

	const ctrl_enter_debounce = debounce(() => {
		query_doc();
	}, 250, 5000);

	
	const ctrl_enter_shortcut: ShortcutParameters = {
		trigger: {
		key: 'Enter',
		modifier: ['ctrl'],
		callback: ctrl_enter_debounce,
		},
	}

	$: {
		let hash_match = $page.url.hash.match(/citation-(\d+)/)
		if(hash_match != null) {
			accordion_i = parseInt(hash_match[1])
			goto("#", {replaceState: true})
		}  
	}
</script>

<b>Doc Search:</b>
<hr>
<div class="my-2 p-4 bg-base-300 rounded-lg">
Enter your search below, you can write a search term or a type out a whole question! You must verify any and all responses using the references included before using any of this information. 
<br>
Remember: If it's not cited and/or you haven't verified it in the source material, you can't trust it. 
</div>
<textarea class="textarea w-full mt-4 border-blue-400" bind:value={query} on:input="{() => {url_query_push({'query': query || ""});}}" use:shortcut={ctrl_enter_shortcut}/>
<div class="my-2 flex items-center">
	{#if $uaccount }
		{#if $uaccount.coins > 0 || ($uaccount.oai_key && $uaccount.oai_key.trim != "")}
			<button type="submit" class="btn btn-outline mx-1 shadow-xl" on:click={query_doc}>Query Doc</button>
		{:else}
			<a class="btn btn-outline mx-1 shadow-xl btn-error" href="/addcoins">Please Reload Coins</a>
		{/if}
	{:else}
		<a class="btn btn-outline mx-1 shadow-xl btn-warning" href="/login">Please Login To Search</a>
	{/if}
	<button type="submit" class="btn btn-outline mx-1 shadow-xl" on:click={() => {query=regen_default_query()}}><Icon icon="mdi:restart" class="font-bold"/></button>
	<button type="submit" class="btn btn-outline mx-1 shadow-xl" on:click="{() => {query=''}}"><Icon icon="ph:x-bold"/></button>
</div>
<hr>
{#if query_result != ""}
	<div>
		<div class="card shadow-xl mx-auto my-4 p-2 bg-base-100 text-center {(query_result == undefined) ? 'w-1/2]' : 'w-[80%]'}">
			{#if query_result == undefined }
					<div><i>Please wait while your search is processed</i></div>
					<div class="loading loading-bars loading-md mx-auto"></div>
					<br>
					{(search_time/1000).toFixed(1)} seconds elapsed
			{:else}
			<div class="text-left p-2 space-y-2">
				<SvelteMarkdown source={query_result} />
				{#if !loading_query_result}
					<CopyToClipboard text={query_result.replaceAll(/(\[{1,2}\d+\]{1,2})?(\(#citation-\d+\))?/g, "")} on:copy={() => toast.push("Copied to clipboard!", {classes: ["info"]})} on:fail={(e) => toast.push("Error cannot copy to clipboard: " + e, {classes: ["warn"]})} let:copy>
						<button on:click={copy} class="btn btn-xs float-right">Copy Raw</button>
					</CopyToClipboard>
				{/if}
			</div>
			{#if loading_query_result} 
				<div class="loading loading-bars loading-md mx-auto"></div>
			{/if}

			{#if docs.length > 0}
				<hr class="my-4">
				<h1 class="mb-3">Sources:</h1>
				{#each docs as s, i}
					{#if result_citation_list.includes(i+1) || !hide_unused_docs}
						<div class="collapse collapse-arrow bg-base-200" id="citation-{i+1}">
							<input type="radio" name="my-accordion-2" value={i+1} bind:group={accordion_i} /> 
							<div class="collapse-title text-xl font-medium">
								P{s.metadata.page} -- {s.metadata.title}
							</div>
							<div class="collapse-content">
								{#if s.metadata.url || Object.keys(title_to_pdf_lookup).includes(s.metadata.title)} 
									{#if s.metadata.url.includes(".pdf")  || Object.keys(title_to_pdf_lookup).includes(s.metadata.title)} 
										<a on:click={open_pdf(s.metadata.url || title_to_pdf_lookup[s.metadata.title], s.metadata.page)} class="underline text-lg" target="_blank">See Source Document</a>
									{:else}
										<a href={s.metadata.url} class="underline text-lg" target="_blank">See Source Document</a>
									{/if}
								{:else}
									<a href={linkgen(s)} class="underline text-lg" target="_blank">See Source Document</a>
								{/if}
								<hr class="my-2">
								<div class="text-left p-2 space-y-2">
									<SvelteMarkdown source={s.pageContent} />
								</div>
							</div>
						</div>
					{/if}
				{/each}
				<div class="my-2">
					<input type="checkbox" bind:checked={hide_unused_docs}> Hide Unused Sources
				</div>
				{/if}
			{/if}
		</div>
		<div id="pdfview-container">
		{#if pdf_page > 0}
			<div class="card shadow-xl mx-auto my-4 p-2 bg-base-100 text-center w-full">
				<PDFViewer bind:pdf_page={pdf_page} bind:url={pdf_url} />
			</div>
		{/if}
		</div>
	</div>

	<hr>
{/if}
	

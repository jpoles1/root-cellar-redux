<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import { onMount } from "svelte";

    let oops_list = [];
    onMount(async () => {{
        oops_list = (await pb.collection("oops").getList(1, 100, {"expand": "user,tags", sort: "-id"})).items
    }})
</script>

<div class="flex flex-row flex-wrap justify-around">
    {#each oops_list as oops_entry}
        <div class="p-2 max-h-[600px] max-w-[50%] min-w-[300px]">
            <div class="card shadow-lg h-full bg-neutral p-3 break-words">
                <div class="h-full w-full overflow-auto">
                    <div class="text-lg font-bold underline">{oops_entry.title}</div>
                    <div class="text-sm italic">{oops_entry.desc}</div>
                    <div class="my-2"><span class="bg-secondary-focus text-secondary-content p-1 rounded-md my-2">Prompt:</span></div>
                    <div>
                        {oops_entry.prompt}
                    </div>
                    <!--{oops_entry.prompt.length > 100 ? oops_entry.prompt.slice(0, 100)+"..." : oops_entry.prompt}-->
                    <hr class="my-4">
                    <div class="my-2"><span class="bg-secondary-focus text-secondary-content p-1 rounded-md my-2">AI Response:</span></div>
                    <div>
                        {oops_entry.ai_resp}
                    </div>

                </div>
            </div>
        </div>
    {/each}
</div>
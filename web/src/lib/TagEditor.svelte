<script lang="ts">
    import Tags from './TagInput.svelte'
    import Tags2 from 'svelte-tags-input'
    import { onMount } from "svelte";
	import { pb } from './pocketbase';
	import type { Recipe } from './root';
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher()

    export let recipe: Recipe;
    let tag_list: string[] = [];

    onMount(async () => {
        tag_list = await pb.send("/rootapi/tags", {}).then(({ result }) => {
            // flattens then de-duplicates
            return result.map((x: any) => x.tags).flat()
            .filter((x: any, i: any, a: any) => x && a.indexOf(x) == i)
        })
    })

    const try_save_tags = () => {
        recipe.tags = [...recipe.tags.filter((x) => x).map((x: string) => x.toLowerCase())]
        dispatch("save")
    }

</script>

<div>
    <Tags bind:tags="{recipe.tags}" on:change="{try_save_tags}" 
    addKeys={[13]} removeKeys={[]}
    placeholder={"Type your tag then press enter"}
    autoComplete={tag_list}
    minChars={3}
    onlyUnique
/>
</div>
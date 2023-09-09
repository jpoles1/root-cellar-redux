<script lang="ts">
	import { goto } from "$app/navigation";
	import { debounce } from "$lib/debounce.js";
	import { pb, uaccount } from "$lib/pocketbase.js";
	import { Recipe, recipe_from_google_recipe } from "$lib/root.js";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";

    export let data;
    let recipe_url = "https://www.foodnetwork.com/recipes/linguine-alla-chitarra-with-clams-guanciale-and-pea-tendrils-2518089";
    let import_started = false;

    const import_recipe = async (): Recipe => {
        if (import_started) {
            toast.push("Already attempting an import, please be patient...")
            return
        }
        import_started = true
        fetch("/recipe/webimport", {
            method: "POST",
            body: JSON.stringify({ recipe_url }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (resp) => {
            let script_matches = await resp.json()
            let first_match = JSON.parse(script_matches[0])
            console.log("first_match", first_match)
            const google_recipe = first_match[0] || first_match
            console.log(google_recipe)
            const recipe = recipe_from_google_recipe(google_recipe)
            recipe.uid = $uaccount!.id
            recipe.og_url = recipe_url
            console.log(recipe)
            const new_recipe = await pb.collection("recipes").create(recipe)
            goto(`/recipe/${new_recipe.id}/edit`)
        }).catch((e) => {
            toast.push(`Import failed: ${e}`)
        }).finally(() => {
            import_started = false
        })

    }
    let import_debounce = debounce(import_recipe, 0, 1000)
    const try_import = () => {
        import_debounce()
    }
</script>

<div class="flex items-center flex-col space-y-5">
    <h1>URL Import:</h1>
    <div class="w-full flex justify-center">
        <input bind:value="{recipe_url}" class="input input-xl w-[50%] max-w-[800px]" placeholder="Paste recipe website url here..."/>
        <button class="btn btn-primary" on:click="{try_import}" disabled={import_started}>Import Recipe</button>
    </div>
    <div>
        {#if import_started}
            <h2>Import in progress, please wait...</h2>
            <progress class="progress w-56"></progress>
        {/if}
    </div>
</div>
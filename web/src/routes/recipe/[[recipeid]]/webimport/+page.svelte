<script lang="ts">
	import { goto } from "$app/navigation";
	import { debounce } from "$lib/debounce.js";
	import { pb, uaccount } from "$lib/pocketbase.js";
	import { Recipe, recipe_from_google_recipe } from "$lib/root.js";
	import { fail } from "@sveltejs/kit";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";

    export let data;
    let recipe_url = "";
    let import_started = false;
    let failure_count = 0;

    const import_recipe = async (): Promise<Recipe | undefined> => {
        if (import_started) {
            toast.push("Already attempting an import, please be patient...")
            return undefined
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
            const google_recipe = first_match[0] || first_match
            const recipe = recipe_from_google_recipe(google_recipe)
            recipe.uid = $uaccount!.id
            recipe.og_url = recipe_url
            const new_recipe = await pb.collection("recipes").create(recipe)
            goto(`/recipe/${new_recipe.id}/edit`)
        }).catch((e) => {
            console.log(`Import failed: ${e}`)
            toast.push(`Import failed: ${e}`)
            failure_count++
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
        {#if failure_count > 1} 
            <div class="card shadow m-10 max-w-1/3 p-5 bg-base-300 italic">
                If you are having trouble importing a recipe, it is likely the website does not support auto-imports.
                <br>
                We recommend instead manually importting the recipe by proceeding to the <a class="link" href="/recipe/edit?raweditor=true">Add Recipe</a> page and using the "Raw" editor and simply copy-pasting in the ingredients and instructions.
            </div>
        {/if}
    </div>
</div>
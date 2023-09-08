<script lang="ts">
	import { goto } from "$app/navigation";
	import { pb, uaccount } from "$lib/pocketbase";
	import type { Recipe } from "$lib/root";
	import Icon from "@iconify/svelte";

    export let recipe: Recipe;
    export let editing: boolean = false
    export let viewing: boolean = false
    
    $: owner = $uaccount && recipe.uid == $uaccount.id
    
    const duplicate = async () => {
        if(confirm("Are you sure you want to duplicate this recipe?")) {
            let new_recipe: Recipe = JSON.parse(JSON.stringify(recipe))
            //Giving credit
            if (!recipe.og_id) {
                new_recipe.og_id = recipe.id
            }
            new_recipe.id = ""
            new_recipe.pics = []
            new_recipe.title = new_recipe.title + " - Copy"
            new_recipe = await pb.collection("recipes").create(new_recipe)
            goto(`/recipe/${new_recipe.id}/edit`, {invalidateAll: true})
        }
    }
    const toggle_archive = async () => {
        if(recipe.archived || confirm("Are you sure you want to archive this recipe?")) {
            recipe.archived = !recipe.archived
            await pb.collection("recipes").update(recipe.id, recipe)
        }
    }
</script>

<div class="flex justify-center space-x-4 my-4">
    {#if recipe && recipe.id}
        {#if owner && !editing}
            <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/edit">
                <Icon icon="fa6-solid:pencil" class="font-bold"/> Edit
            </a>
        {/if}
        {#if !viewing}
            <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/view">
                <Icon icon="fa6-solid:magnifying-glass" class="font-bold"/> View
            </a>
        {/if}
        <btn class="btn btn-primary btn-sm font-bold" on:click="{duplicate}">
            <Icon icon="system-uicons:duplicate" class="font-bold"/> Duplicate
        </btn>
        {#if owner}
            <btn class="btn btn-primary btn-sm font-bold" on:click="{toggle_archive}">
                <Icon icon="system-uicons:archive" class="font-bold"/> {recipe.archived ? 'Unarchive' : 'Archive' }
            </btn>
        {/if}
    {/if}
</div>
<script lang="ts">
	import TextInput from "$lib/input/TextInput.svelte";
    import NumInput from "$lib/input/NumInput.svelte";
    import {Recipe, Ingredient, Instruction} from "$lib/root"
    import {debounce} from "$lib/debounce"
	import { pb, uaccount } from "$lib/pocketbase";
    import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast'
	import RecipeToolbar from "$lib/RecipeToolbar.svelte";
	import Gallery from "$lib/gallery/Gallery.svelte";
	import { goto } from "$app/navigation";
	import Nutrition from "$lib/Nutrition.svelte";

    export let data;
    let recipeid = data.recipeid;
    let recipe: Recipe

    let ingredients_compelted: Record<number, boolean> = {}
    let instructions_completed: Record<number, boolean> = {}

    onMount(async () => {
        if (recipeid == undefined || recipeid == "") {
            recipe = new Recipe()
        } else {
            recipe = new Recipe(await pb.collection("recipes").getOne(recipeid).catch((r) => {
                    toast.push("Error loading recipe, returning to home page...")
                    setTimeout(() => {
                        goto("/")
                    }, 3000)
                    return r
            }))
        }
    });
</script>

<svelte:head>
    <title>{recipe && recipe.title ? `${recipe.title} - ` : ""}Root Cellar</title> 
</svelte:head>

<div> 
    {#if recipe}
        <div class="flex flex-col justify-center mb-10">
            <div class="m-auto w-[800px] max-w-[96%] text-[28pt] text-center mb-4">
                {recipe.title}
            </div>
            {#if recipe.description.length > 3}
                <div class="m-auto max-w-[80%] text-center p-4 bg-info rounded">
                    {recipe.description}
                </div>
            {/if}
        </div>
        <div class="flex justify-center space-x-8 mb-5">
            <NumInput placeholder="# of Servings" bind:value="{recipe.servings}" class="w-24 border" noarrows alwaysfloatplaceholder disabled />
            <NumInput placeholder="Active Time" bind:value="{recipe.active_time}" class="w-24 border" noarrows alwaysfloatplaceholder disabled />
            <NumInput placeholder="Total Time" bind:value="{recipe.total_time}" class="w-24 border" noarrows  alwaysfloatplaceholder disabled />
        </div>
        {#if recipe.og_url && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(recipe.og_url) }
            <div class="text-center mb-5">
                <a href="{recipe.og_url}" target="_blank" class="link text-lg w-[500px]">Original Recipe</a>
            </div>
        {/if}
        <div class="flex justify-center my-10 space-x-4">
            <Gallery bind:recipe="{recipe}" editable="{false}"/>
        </div>
        <hr>
        <RecipeToolbar recipe="{recipe}" viewing/>
        <hr>
        <div class="flex justify-center">
            <Nutrition recipe="{recipe}" editable="{false}"/>
        </div>
        <hr>
        <div>
            <div class="flex justify-around flex-wrap">
                <div class="recipe-section text-center">
                    <h1 class="my-5">Ingredients</h1>
                    <hr class="my-5">
                    <div class="flex justify-center">
                        <div class="ol text-left text-xl space-y-4">
                            {#each recipe.ingredients_to_txt().split("\n") as ingred, i}
                                <li class="flex">                                    
                                    <input type="checkbox" class="checkbox mr-4" bind:checked="{ingredients_compelted[i]}"/>
                                    {ingred}
                                </li>
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="recipe-section text-center">
                    <h1 class="my-5">Instructions</h1>
                    <hr class="my-5">
                    <div class="space-y-4">
                        {#each recipe.instructions as instruct, i}
                            <div>
                                <div class="instruction-order h-[40px] flex">
                                    <b>#</b>
                                    <div class="p-1">{ i + 1 }</div>
                                </div>
                                <div class="instruction-order mr-2 h-[40px]">
                                    <input type="checkbox" class="checkbox" bind:checked="{instructions_completed[i]}"/>
                                </div>
                                <div class="instruction-order mr-2 h-[40px]">
                                    <!--Opt: <input type="checkbox" class="checkbox"/>-->
                                    <div class="btn btn-xs btn-active">{instruct.optional ? 'Optional' : 'Required'}</div>
                                </div>
                                <div class="clear-both p-4 bg-base-100 border-black border text-left">
                                    {instruct.instruction}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex justify-center">
            <div class="flex justify-center flex-col text-center">
                <h1 class="h1 my-5">Loading Recipe...</h1>
                <progress class="progress w-56"></progress>
            </div>
        </div>
    {/if}
</div>

<style lang="postcss">
.recipe-header-inputs {
	display: flex;
	justify-content: center;
	margin: -15px 0;
}
.recipe-header-inputs .input {
	max-width: 180px;
	transform: scale(0.8);
}
.recipe-section {
	width: 45%;
	max-width: 100%;
	min-width: min(100%, 480px);
	margin-bottom: 20px;
}
.ingredient-entry {
	margin: 12px 0;
}
.ingredient-ingredient-input {
	width: min(100%, 280px);
}
.ingredient-notes-input textarea {
	padding: 5px 8px !important;
}
.instruction-order {
	float: right;
	border: 1px solid #555;
	border-bottom: none;
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
	padding: 4px;
}
.instruction-order-input {
	width: 30px !important;
	text-align: center;
	border: none !important;
}
.ingredient-notes-input {
	width: min(100%, calc(60px + 100px + 280px));
	font-style: italic;
	margin-top: 6px;
    padding: 10px;
}
.recipe-section input,
.recipe-title-input {
	border: 1px solid #555;
	padding: 3px 10px;
	border-radius: 2px !important;
}
.instruction-order-input {
	border: none;
}
textarea {
	border: 1px solid #555 !important;
	padding: 6px;
	border-radius: 2px !important;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
</style>

<script lang="ts">
	import { pb, uaccount } from "$lib/pocketbase";
	import { onMount } from "svelte";
	import { debounce } from "$lib/debounce";
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";
	import type { Recipe } from "./root";
	import { page } from "$app/stores";
	import Nutrition from "$lib/Nutrition.svelte";

    let recipes: Recipe[] = []
    let search_query = $page.url.searchParams.get("query") || "";
    let filter_archived = ($page.url.searchParams.get("archived") || 'true') == "true";
    let filter_my_recipes = $page.url.searchParams.get("my_recipes") == "true";
    let filter_private_recipes = $page.url.searchParams.get("private_recipes") == "true";
    let searching = false;

    let active_nutr_fact: Recipe | undefined = undefined;
    
    const search_recipes = async () => {
        searching = true
        let title_search = search_query ? `(title ?~ '${search_query}' || ingredients ?~ '${search_query}' || tags ?~ '${search_query}')` : undefined
        let archived_search = filter_archived ? `(archived=false)` : undefined
        let my_recipe_search = filter_my_recipes && $uaccount && $uaccount.id ? `(uid='${$uaccount.id}')` : undefined
        let private_recipe_search = filter_private_recipes && $uaccount && $uaccount.id ? `(public=false)` : undefined
        let filter_parts = [title_search, archived_search, my_recipe_search, private_recipe_search].filter((x) => x)
        let filter_str = filter_parts.join("&&")
        let filter_obj: any = {filter: filter_str, sort: '-created', limit: 100}
        /*if($uaccount && $uaccount.admin) {
            // Get more user info for admins
            filter_obj.expand = "uid"
        }*/
        recipes = await pb.collection("recipes").getFullList(filter_obj)
        goto (`/?query=${search_query}&archived=${filter_archived}&my_recipes=${filter_my_recipes}&private_recipes=${filter_private_recipes}`)
        searching = false
    }
    let search_debounce = debounce(search_recipes, 500, 1000)
    let fast_search_debounce = debounce(search_recipes, 250, 0)
    const try_search_recipes = () => {
        search_debounce()
    }

    onMount(async () => {
        if(!$uaccount) {
            goto("/login"); 
            return
        }
        search_recipes()
    })
</script>

<svelte:head>
    <title>Recipe Search - Root Cellar</title> 
</svelte:head>

<div class="max-h-full flex flex-col">
    <div class="flex max-md:flex-col flex-row justify-center text-right">
        <div class="flex-grow mx-auto"> 
            <input type="text" placeholder="Search Recipes..." bind:value="{search_query}" class="input w-full text-[14pt] text-center p-5" on:input="{try_search_recipes}"/>
        </div>
        <div class="flex align-top flex-col flex-wrap max-h-[60px] max-md:flex-row max-md:justify-around max-md:mt-5 ml-5 space-x-5">
            <div>
                <input type="checkbox" bind:checked="{filter_archived}" on:input="{fast_search_debounce}" /> Hide Archived
            </div>
            <div>
                <input type="checkbox" bind:checked="{filter_my_recipes}" on:input="{fast_search_debounce}" /> My Recipes
            </div>
            <div>
                <input type="checkbox" bind:checked="{filter_private_recipes}" on:input="{fast_search_debounce}" /> Private Recipes
            </div>
        </div>
    </div>
    <hr class="my-5">
    {#if searching} 
        <div class="flex flex-col justify-center items-center w-full p-5 mb-10">
            <h2>Searching for recipes, please wait...</h2>
            <br>
            <progress class="progress w-56"></progress>
        </div>
    {/if}
    <div class="flex justify-center w-full flex-wrap overflow-y-auto max-h-full">
        {#each recipes as recipe}
            <div class="card overflow-hidden w-[250px] bg-base-100 mt-5 ml-5">
                <a href="/recipe/{recipe.id}/view">
                    <figure class="h-[160px]">
                        <img src="{recipe.pics[0] ? pb.files.getUrl(recipe, recipe.pics[0], {'thumb': '160x100'}) : (recipe.pic_urls ? recipe.pic_urls[0] : '/sprout_wide.png') || '/sprout_wide.png'}" alt="Recipe Photo" />
                    </figure>
                </a>
                <div class="card-body p-4">
                    <div class="h-[140px] flex flex-col text-sm overflow-y-auto">
                        <div class="card-title text-[16px]">{recipe.title}</div>
                        {#if $uaccount && $uaccount.admin}
                            <span>User: <a class="link" href="/user/{recipe.uid}">{recipe.expand.uid ? `${recipe.expand.uid.username}#` : '' }{(recipe.uid || '').slice(0, 8)}</a></span>
                            <span><a class="link" href="/user/{recipe.uid}">{recipe.expand.uid ? recipe.expand.uid.email || '' : ''}</a></span>
                        {/if}
                        {#if recipe.serving_size || recipe.calories || recipe.protein || recipe.fat || recipe.carbs}
                            <div class="mt-1">
                                <a class="btn btn-xs nutr-hover-trigger" on:mousedown={() => {active_nutr_fact = recipe; nutr_modal.showModal()}} on:touchstart={() => {active_nutr_fact = recipe; nutr_modal.showModal()}} >
                                    Nutrition Facts
                                </a>
                        </div>
                        {/if}
                    </div>
                    <div class="card-actions justify-end">
                        {#if recipe.archived}
                            <button class="btn btn-primary btn-sm tooltip tooltip-warning" data-tip="Archived">
                                <Icon icon="system-uicons:archive" class="font-bold"/>
                            </button>
                        {/if}
                        {#if $uaccount && $uaccount.id == recipe.uid}
                            {#if !recipe.public}
                                <button class="btn btn-primary btn-sm font-bold tooltip tooltip-warning" data-tip="Private">
                                    <Icon icon="fa6-solid:key" class="font-bold"/>
                                </button>
                            {/if}
                            <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/edit">
                                <Icon icon="fa6-solid:pencil" class="font-bold"/>
                            </a>
                        {/if}
                        <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/view">
                            <Icon icon="fa6-solid:magnifying-glass" class="font-bold"/>
                        </a>
                    </div>                  
                </div>
            </div>
        {/each}
        {#if recipes.length == 0} 
            <h1>Sorry, no recipes found...</h1>
        {/if}
        <dialog id="nutr_modal" class="modal"  on:mouseup={() => {active_nutr_fact = undefined; nutr_modal.close()}} on:touchend={() => {active_nutr_fact = undefined; nutr_modal.close()}}>
            <div class="modal-box">
                {#if active_nutr_fact}
                    <Nutrition recipe="{active_nutr_fact}"/>
                {/if}
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>            
        </dialog>
    </div>
</div>
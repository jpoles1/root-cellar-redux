<script lang="ts">
	import { pb, uaccount } from "$lib/pocketbase";
	import { onMount } from "svelte";
	import { debounce } from "$lib/debounce";
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";
	import type { Recipe } from "./root";

    let recipes: Recipe[] = []
    let search_query = "";
    let filter_archived = true;
    let filter_my_recipes = false;
    let searching = false;

    const search_recipes = async () => {
        searching = true
        let title_search = search_query ? `(title ?~ '${search_query}' || ingredients ?~ '${search_query}' || tags ?~ '${search_query}')` : undefined
        let archived_search = filter_archived ? `(archived=false)` : undefined
        let my_recipe_search = filter_my_recipes && $uaccount && $uaccount.id ? `(uid='${$uaccount.id}')` : undefined
        let filter_parts = [title_search, archived_search, my_recipe_search].filter((x) => x)
        let filter_str = filter_parts.join("&&")
        recipes = await pb.collection("recipes").getFullList({filter: filter_str, sort: '-created', limit: 100})
        searching = false
    }
    let search_debounce = debounce(search_recipes, 500, 1000)
    let fast_search_debounce = debounce(search_recipes, 150, 1000)
    const try_search_recipes = () => {
        search_debounce()
    }

    onMount(async () => {
        if(!$uaccount) goto("/login");
        search_recipes()
    })
</script>

<div class="max-h-full flex flex-col">
    <div class="flex max-md:flex-col flex-row justify-center text-right">
        <div class="flex-grow mx-auto"> 
            <input type="text" placeholder="Search Recipes..." bind:value="{search_query}" class="input w-full text-[14pt] text-center p-5" on:input="{try_search_recipes}"/>
        </div>
        <div class="flex align-top flex-col max-md:flex-row max-md:justify-around max-md:mt-5 ml-5">
            <div>
                <input type="checkbox" bind:checked="{filter_archived}" on:input="{fast_search_debounce}" /> Hide Archived
            </div>
            <div>
                <input type="checkbox" bind:checked="{filter_my_recipes}" on:input="{fast_search_debounce}" /> My Recipes
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
                    <figure class="h-[200px]">
                        <img src="{recipe.pics[0] ? pb.files.getUrl(recipe, recipe.pics[0], {'thumb': '100x200'}) : (recipe.pic_urls ? recipe.pic_urls[0] : '/sprout_wide.png') || '/sprout_wide.png'}" alt="Recipe Photo" />
                    </figure>
                </a>
                <div class="card-body p-4">
                    <div class="h-[100px]">
                        <div class="card-title text-[16px]">{recipe.title}</div>
                        {#if recipe.servings}
                            <i>Servings: {recipe.servings}</i>
                        {/if}
                    </div>
                    <div class="card-actions justify-end">
                        {#if $uaccount && $uaccount.id == recipe.uid}
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
    </div>
</div>
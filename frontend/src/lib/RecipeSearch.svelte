<script lang="ts">
	import { pb, uaccount } from "$lib/pocketbase";
	import { onMount } from "svelte";
	import { debounce } from "$lib/debounce";
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";

    let recipes = []
    let search_query = "";
    let filter_archived = false;
    let filter_my_recipes = false;
    let searching = false;

    const search_recipes = async () => {
        searching = true
        let title_search = search_query ? `(title ?~ '${search_query}' || ingredients ?~ '${search_query}' || tags ?~ '${search_query}')` : undefined
        let archived_search = !filter_archived ? `(archived=false)` : undefined
        let my_recipe_search = filter_my_recipes && $uaccount && $uaccount.id ? `(uid='${$uaccount.id}')` : undefined
        let filter_parts = [title_search, archived_search, my_recipe_search].filter((x) => x)
        let filter_str = filter_parts.join(" && ")
        recipes = await pb.collection("recipes").getFullList({filter: filter_str, sort: '-created', limit: 100})
        searching = false
    }
    let search_debounce = debounce(search_recipes, 500, 1000)
    const try_search_recipes = () => {
        search_debounce()
    }

    onMount(async () => {
        if(!$uaccount) goto("/login");
        search_recipes()
    })
</script>

<div>
    <div class="grid max-md:grid-rows-2 max-md:grid-cols-1 grid-cols-2 grid-rows-1 justify-center flex-grow-0">
        <div class="max-w-[800px] w-[90%] mx-auto"> 
            <input type="text" placeholder="Search Recipes..." bind:value="{search_query}" class="input w-full text-[14pt] text-center p-8" on:input="{try_search_recipes}"/>
        </div>
        <div class="flex align-top flex-col max-md:flex-row max-md:justify-around max-md:mt-5">
            <div>
                <input type="checkbox" bind:checked="{filter_archived}" on:input="{search_recipes}" /> Show Archived
            </div>
            <div>
                <input type="checkbox" bind:checked="{filter_my_recipes}" on:input="{search_recipes}" /> My Recipes
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
    <div class="flex justify-center space-x-5 space-y-5 w-full flex-wrap">
        {#each recipes as recipe}
            <div class="card overflow-hidden w-[300px] bg-base-100">
                <a href="/recipe/{recipe.id}/view">
                    <figure class="h-[200px]">
                        <img src="{recipe.pics[0] ? pb.files.getUrl(recipe, recipe.pics[0], {'thumb': '100x200'}) : (recipe.pic_urls ? recipe.pic_urls[0] : '/sprout_wide.png') || '/sprout_wide.png'}" alt="Recipe Photo" />
                    </figure>
                </a>
                <div class="card-body">
                    <div class="h-[100px]">
                        <h3 class="card-title">{recipe.title}</h3>
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
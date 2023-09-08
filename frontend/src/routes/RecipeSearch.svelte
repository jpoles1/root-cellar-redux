<!--
<div style="display: flex; justify-content: center; flex-wrap: wrap;">
    <headful title="Root Cellar - Recipe List" />
    <v-card v-for="(recipe, recipeIndex) in recipeList" :key="recipeIndex" class="recipe-list-card">
        <div>
            <h3 @click="$router.push(`/recipe/${recipe.id}/`)" style="cursor: pointer">{{ recipe.name }}</h3>
            <div v-if="recipe.servings != ''">Servings: {{ recipe.servings }}</div>
            <div v-if="recipe.active_time != ''">Active Time: {{ recipe.active_time }} min</div>
            <div v-if="recipe.total_time != ''">Total Time: {{ recipe.total_time }} min</div>
            Created on: {{ when_created(recipe.id) }}
            <div style="transform: scale(0.8); text-align: center;">
                <v-btn :href="`/recipe/${recipe.id}/`" class="primary" small fab style="margin: 5px 10px"><i class="fas fa-search" style="font-size: 150%;"/></v-btn>
                <v-btn :href="`/recipe/${recipe.id}/edit`" class="primary" small fab><i class="fas fa-pencil-alt" style="font-size: 150%;"/></v-btn>
            </div>
        </div>
    </v-card>
</div>
-->
<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import { onMount } from "svelte";
	import TextInput from "./TextInput.svelte";
	import { debounce } from "$lib/debounce";
	import Icon from "@iconify/svelte";

    let recipes = []
    let search_my_recipes = false;
    let search_query = "";

    const search_recipes = async () => {
        let title_search = search_query ? `&& (title ?~ '${search_query}' || ingredients ?~ '${search_query}')` : ''
        let archived_search = 'archived=false'
        recipes = await pb.collection("recipes").getFullList({filter: `${archived_search} ${title_search}`})
        console.log(recipes)
    }
    let search_debounce = debounce(search_recipes, 500, 1000)
    const try_search_recipes = () => {
        search_debounce()
    }

    onMount(async () => {
        search_recipes()
    })
</script>

<div>
    <h1>Root Recipes</h1>
    <div class="flex justify-center">
        <input type="text" placeholder="Search Recipes..." bind:value="{search_query}" class="input m-auto w-[800px] max-w-[96%] text-[14pt] text-center p-8" on:input="{try_search_recipes}"/>
    </div>
    <hr class="my-5">
    <div class="flex justify-center space-x-5 w-full">
        {#each recipes as recipe}
            <div class="card w-[300px] bg-base-100">
                <a href="/recipe/{recipe.id}/view">
                    <figure class="h-[200px]">
                        <img src="{recipe.pics[0] ? pb.files.getUrl(recipe, recipe.pics[0], {'thumb': '100x200'}) : '/sprout_wide.png'}" alt="Recipe Photo" />
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
                        <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/edit">
                            <Icon icon="fa6-solid:pencil" class="font-bold"/>
                        </a>
                        <a class="btn btn-primary btn-sm font-bold" href="/recipe/{recipe.id}/view">
                            <Icon icon="fa6-solid:magnifying-glass" class="font-bold"/>
                        </a>
                    </div>                  
                </div>
            </div>
        {/each}
    </div>
</div>
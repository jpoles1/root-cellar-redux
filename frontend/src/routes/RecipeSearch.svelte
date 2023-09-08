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

    let recipes = []

    onMount(() => {
        recipes = pb.collection("recipes").getFullList()
    })
</script>

<div>
    <h2>Root Recipes</h2>
    <div>
        {#each recipes as recipe}
            {JSON.stringify(recipe)}
        {/each}
    </div>
</div>
<script lang="ts">
	import { onMount } from "svelte";
	import type { Recipe } from "$lib/root";

    export let recipe: Recipe;
    
    onMount(async () => {
        console.log(recipe);
        console.log(JSON.stringify({ingredients: recipe.ingredients}))
        let nutr = await fetch("/nutrition", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ingredients: recipe.ingredients})
        }).then(res => res.json());
        console.log(nutr);
    });
</script>

<h1>Nutrition Calculator</h1>


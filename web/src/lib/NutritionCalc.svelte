<script lang="ts">
	import { onMount } from "svelte";
	import type { Ingredient, Recipe } from "$lib/root";
	import NumInput from "./input/NumInput.svelte";

    export let recipe: Recipe;
    let nutr: any[] = [];
    let nutr_sel: number[] = [];
    let serving_mult: number[] = [];
    let enable_serving_g_to_oz = true;

    const recalculate_nutrition = () => {
        const calc_nutr = nutr
            .map((_, i) => nutr[i][nutr_sel[i]])
            .reduce(
                (a, b) => {
                    return {
                        energy_amount: (a.energy_amount || 0) + (b?.energy_amount || 0),
                        fat_amount: (a.fat_amount || 0) + (b?.fat_amount || 0),
                        fat_unit: a.fat_unit || b?.fat_unit,
                        carb_amount: (a.carb_amount || 0) + (b?.carb_amount || 0),
                        carb_unit: a.carb_unit || b?.carb_unit,
                        protein_amount: (a.protein_amount || 0) + (b?.protein_amount || 0),
                        protein_unit: a.protein_unit || b?.protein_unit,
                    };
                },
                {}
            );
        recipe.calories = calc_nutr.energy_amount;
        recipe.fat = calc_nutr.fat_amount;
        recipe.carbs = calc_nutr.carb_amount;
        recipe.protein = calc_nutr.protein_amount;
    };

    $: nlook = (i: number) => {
        return nutr[i][nutr_sel[i]] || {}
    }

    $: calc_serving_size = (i: number) => {
        if (enable_serving_g_to_oz && nlook(i).serving_size_unit && nlook(i).serving_size_unit.toLowerCase() == "g") {
            return (nlook(i).serving_size * 0.035274).toFixed(1) + " oz"
        }
        return `${nlook(i).serving_size || "?"}${nlook(i).serving_size_unit ? ' ' + nlook(i).serving_size_unit : ""}`
    }

    onMount(async () => {
        let resp_data = await fetch("/nutrition", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ingredients: recipe.ingredients})
        }).then(res => res.json());
        nutr = resp_data.nutrition
        nutr_sel = recipe.ingredients.map(() => 0)
        serving_mult = recipe.ingredients.map(() => 1)
        console.log(nutr)
    });
</script>
<div class="flex flex-col">
    <h1>Nutrition Calculator</h1>
    <div>
        Serving Size:
        <br>
        Gram <input type="checkbox" class="toggle" bind:checked="{enable_serving_g_to_oz}" /> Ounce
    </div>
    <table class="table">
        <tr>
            <th>Ingredient</th>
            <th>Matches</th>
            <th>Serving Size</th>
            <th>Serving Mult</th>
            <th>Calories</th>
            <th>Fat</th>
            <th>Carbs</th>
            <th>Protein</th>
            <th>Fiber</th>
        </tr>
        {#if nutr.length > 0}
            {#each recipe.ingredients as ingredient, i}
                <tr>
                    <td>
                        {ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} of {ingredient.ingredient}
                    </td>
                    <td>
                        <select class="max-w-[350px]" bind:value={nutr_sel[i]} >
                            {#each nutr[i] as ing_opt, j}
                                <option value="{j}">{ing_opt.description} {(ing_opt.brand_name || ing_opt.brand_owner) ? `- ${ing_opt.brand_name || ing_opt.brand_owner}` : ""}</option> 
                            {/each}
                        </select>
                    </td>
                    <td>
                        {calc_serving_size(i)}
                    </td>
                    <td>
                        <NumInput bind:value={serving_mult[i]} class="w-[60px] border" placeholder=""  />
                    </td>
                    <td>
                        {nlook(i).energy_amount ? (nlook(i).energy_amount * serving_mult[i]).toFixed(0) : "?"}
                    </td>
                    <td>
                        {nlook(i).fat_amount ? (nlook(i).energy_amount * serving_mult[i]).toFixed(0) : "?"} {nlook(i).fat_unit || ""}
                    </td>
                    <td>
                        {nlook(i).carb_amount ? (nlook(i).carb_amount * serving_mult[i]).toFixed(0) : "?"} {nlook(i).carb_unit || ""}
                    </td>
                    <td>
                        {nlook(i).protein_amount ? (nlook(i).protein_amount * serving_mult[i]).toFixed(0) : "?"} {nlook(i).protein_unit || ""}
                    </td>
                    <td>
                        {nlook(i).fiber_amount ? (nlook(i).fiber_amount * serving_mult[i]).toFixed(0) : "?"} {nlook(i).fiber_unit || ""}
                    </td>
                </tr>
            {/each}
            <button class="btn btn-primary" on:click={recalculate_nutrition}>Recalculate Nutrition</button>
        {/if}
    </table>
</div>
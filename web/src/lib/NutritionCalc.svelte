<script lang="ts">
    import { onMount } from "svelte";
    import { Ingredient, type Recipe } from "$lib/root";
    import NumInput from "./input/NumInput.svelte";
	import TextInput from "./input/TextInput.svelte";
    import {debounce} from "$lib/debounce"

    export let recipe: Recipe;
    let sub_ingred: string[] = [];
    let nutr: any[] = [];
    let nutr_sel: number[] = [];
    let serving_mult: number[] = [];
    let enable_serving_metric_to_imperial = true;
    let enable_serving_ml_to_kitchen = false;

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
        const serving_size = nlook(i).serving_size;
        if (enable_serving_metric_to_imperial && nlook(i).serving_size_unit && nlook(i).serving_size_unit.toLowerCase() == "g") {
            return (serving_size / 28).toFixed(1) + " oz"
        }
        if (enable_serving_ml_to_kitchen && nlook(i).serving_size_unit && nlook(i).serving_size_unit.match(/mL/i)) {
            //Convert from mL to kitchen units (one of either cups, tbsp, or tsp) depending on the closest unit by volume
            const tsp = serving_size / 4.92892;
            const tbsp = tsp / 3;
            const cup = tbsp / 16;
            const tsp_diff = Math.abs(tsp - Math.round(tsp));
            const tbsp_diff = Math.abs(tbsp - Math.round(tbsp));
            const cup_diff = Math.abs(cup - Math.round(cup));
            // Decides which is the closest unit by volume
            if (tsp_diff < tbsp_diff && tsp_diff < cup_diff) {
                return tsp.toFixed(1) + " tsp"
            } else if (tbsp_diff < tsp_diff && tbsp_diff < cup_diff) {
                return tbsp.toFixed(1) + " tbsp"
            } else {
                return cup.toFixed(1) + " cup"
            }
        }
        
        return `${serving_size || "?"}${nlook(i).serving_size_unit ? ' ' + nlook(i).serving_size_unit : ""}`
    }

    let regen_nutrition = (i: number, new_name: string) => {
        // Replaces the nutrition entry at i with a newly entered ingredient name
        fetch("/nutrition", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ingredients: [new Ingredient({ingredient: new_name})]})
        }).then(res => res.json()).then(data => {
            console.log(data)
            nutr[i] = data.nutrition[0]
            nutr_sel[i] = 0
        })

    }

    let regen_nutrition_debounce = debounce(regen_nutrition, 1500, 500)
    const try_regen_nutrition = (i: number, new_name: string) => {
        regen_nutrition_debounce(i, new_name)
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
        sub_ingred = recipe.ingredients.map((ingred: Ingredient) => ingred.ingredient)
        console.log(nutr)
    });
</script>
<div class="flex flex-col">
    <h1>Nutrition Calculator</h1>
    <div class="flex flex-row space-x-10">
        <div class="flex flex-row items-center space-x-2">
            <span>Metric</span> <input type="checkbox" class="toggle" bind:checked="{enable_serving_metric_to_imperial}" /> <span>Imperial</span>
        </div>
        <div class="flex flex-row items-center space-x-2">
            <span>mL</span> <input type="checkbox" class="toggle" bind:checked="{enable_serving_ml_to_kitchen}" /> <span>Kitchen</span>
        </div>
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
                    <td class="flex flex-row">
                        <div>{ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} of </div><TextInput bind:value="{sub_ingred[i]}" placeholder="{ingredient.ingredient}" on:change="{(e) => try_regen_nutrition(i, e.target.value)}"/>
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
                        <NumInput bind:value={serving_mult[i]} class="w-[80px] border" placeholder="" step="{0.25}" />
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
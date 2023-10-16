<script lang="ts">
    import { onMount } from "svelte";
    import { Ingredient, type Recipe } from "$lib/root";
    import NumInput from "./input/NumInput.svelte";
	import TextInput from "./input/TextInput.svelte";
    import {debounce} from "$lib/debounce"

    export let recipe: Recipe;
    let ingredients_mirror: Ingredient[] = recipe.ingredients
    let sub_ingred: string[] = [];
    let nutr: any[] = [];
    let nutr_sel: number[] = [];
    let serving_mult: number[] = [];
    let enable_serving_metric_to_imperial = true;
    let enable_serving_ml_to_kitchen = true;
    let custom_nutr = {
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
        sugar: 0,
        fiber: 0,
        sodium: 0
    }

    $: {
        ingredients_mirror = JSON.parse(JSON.stringify(recipe.ingredients))
        if (recipe.ingredients.length > 0) {
            try_regen_nutrition()
        }
    }

    $: recalculate_nutrition = () => {
        const calc_nutr = nutr
            .map((_, i) => nutr[i][nutr_sel[i]])
            .concat([custom_nutr])
            .reduce(
                (a, b, i) => {
                    return {
                        calories: (a.calories || 0) + (b?.calories || 0)  * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        fat: (a.fat || 0) + (b?.fat || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        carbs: (a.carbs || 0) + (b?.carbs || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        protein: (a.protein || 0) + (b?.protein || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        sugar: (a.sugar || 0) + (b?.sugar || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        fiber: (a.fiber || 0) + (b?.fiber || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),
                        sodium: (a.sodium || 0) + (b?.sodium || 0) * (serving_mult[i] != undefined ? serving_mult[i] : 1),

                    };
                },
                {}
            );
        console.log(calc_nutr)
        recipe.calories = Math.round(calc_nutr.calories / (recipe.servings || 1));
        recipe.fat = Math.round(calc_nutr.fat / (recipe.servings || 1));
        recipe.carbs = Math.round(calc_nutr.carbs / (recipe.servings || 1));
        recipe.protein = Math.round(calc_nutr.protein / (recipe.servings || 1));
        recipe.sugar = Math.round(calc_nutr.sugar / (recipe.servings || 1));
        recipe.fiber = Math.round(calc_nutr.fiber / (recipe.servings || 1));
        recipe.sodium = Math.round(calc_nutr.sodium / (recipe.servings || 1));
    };

    $: nlook = (i: number) => {
        return nutr[i] ? nutr[i][nutr_sel[i]] || {} : {}
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
        
        return `${serving_size || ""}${nlook(i).serving_size_unit ? ' ' + nlook(i).serving_size_unit : ""}`
    }

    let regen_single_nutrition = (i: number, new_name: string) => {
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

    let regen_single_nutrition_debounce = debounce(regen_single_nutrition, 1500, 500)
    const try_regen_single_nutrition = (i: number, new_name: string) => {
        regen_single_nutrition_debounce(i, new_name)
    }

    let regen_nutrition = async () => {
        let resp_data = await fetch("/nutrition", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ingredients: recipe.ingredients})
        }).then(res => res.json());
        nutr = resp_data.nutrition || []
        nutr_sel = recipe.ingredients.map(() => 0)
        serving_mult = recipe.ingredients.map(() => 1)
        sub_ingred = recipe.ingredients.map((ingred: Ingredient) => ingred.ingredient)
        console.log(nutr)
    }

    let regen_nutrition_debounce = debounce(regen_nutrition, 1500, 500)
    const try_regen_nutrition = () => {
        regen_nutrition_debounce()
    }

    onMount(async () => {
        regen_nutrition()
    });
</script>
<div class="flex flex-col">
    <h1>Nutrition Calculator</h1>
    <div class="flex flex-row space-x-10 mb-2">
        <div class="flex flex-row items-center space-x-2">
            <span>Metric</span> <input type="checkbox" class="toggle" bind:checked="{enable_serving_metric_to_imperial}" /> <span>Imperial</span>
        </div>
        <div class="flex flex-row items-center space-x-2">
            <span>mL</span> <input type="checkbox" class="toggle" bind:checked="{enable_serving_ml_to_kitchen}" /> <span>Kitchen</span>
        </div>
    </div>
    <table class="table table-auto">
        <thead>
            <tr>
                <th>
                    <div class="tooltip" data-tip="Edit below to refine your nutrition search without changing the recipe ingredients">
                        Ingredient
                    </div>
                </th>
                <th>Matches</th>
                <th>Serving Size</th>
                <th>Serving Mult</th>
                <th>Calories</th>
                <th>Fat</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fiber</th>
                <th>Sugar</th>
                <th>Sodium</th>
            </tr>
        </thead>
        <tbody>
            {#if nutr && nutr.length > 0}
                {#each ingredients_mirror as ingredient, i}
                    <tr class="hover">
                        <td class="pt-4">
                            <div class="flex flex-row align-bottom">
                                <div class="whitespace-nowrap">{ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ""} of&nbsp;&nbsp;</div><TextInput bind:value="{sub_ingred[i]}" placeholder="{ingredient.ingredient.slice(0,25) + (ingredient.ingredient.length > 25 ? "..." : "")}" on:input="{(e) => try_regen_single_nutrition(i, e.target.value)}"/>
                            </div>
                        </td>
                        <td>
                            <select class="max-w-[300px]" bind:value={nutr_sel[i]} >
                                {#if nutr[i] && nutr[i].length > 0}
                                    {#each nutr[i] as ing_opt, j}
                                        <option value="{j}">{ing_opt.description} {(ing_opt.brand) ? `- ${ing_opt.brand}` : ""}</option> 
                                    {/each}
                                {/if}
                            </select>
                        </td>
                        <td>
                            {calc_serving_size(i)}
                            {#if calc_serving_size(i).replaceAll(/\d+(:?[\./]\d+)?/g, "").trim() != ingredient.unit}
                                <br>
                                <a class="link" href="https://www.google.com/search?q={encodeURIComponent(`${calc_serving_size(i)} ${ingredient.ingredient} to ${ingredient.unit}`)}" target="_blank" style="font-size: 70%">Conversion</a>
                            {/if}
                        </td>
                        <td>
                            <NumInput bind:value={serving_mult[i]} class="w-[80px] border" placeholder="" step="{0.25}" />
                        </td>
                        <td>
                            {nlook(i).calories != undefined ? (nlook(i).calories * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "?"}
                        </td>
                        <td>
                            {nlook(i).fat != undefined ? (nlook(i).fat * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}g
                        </td>
                        <td>
                            {nlook(i).protein != undefined ? (nlook(i).protein * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}g
                        </td>
                        <td>
                            {nlook(i).carbs != undefined ? (nlook(i).carbs * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}g
                        </td>
                        <td>
                            {nlook(i).fiber != undefined ? (nlook(i).fiber * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}g
                        </td>
                        <td>
                            {nlook(i).sugar != undefined ? (nlook(i).sugar * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}g
                        </td>
                        <td>
                            {nlook(i).sodium != undefined ? (nlook(i).sodium * (serving_mult[i] != undefined ? serving_mult[i] : 1)).toFixed(0) : "? "}mg
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td>Custom Nutrition:</td>
                    <td class="italic">(Optional)</td>
                    <td></td>
                    <td></td>
                    {#each ["calories", "fat", "protein", "carbs", "fiber", "sugar", "sodium"] as nutr_type}
                    <td>
                        <NumInput bind:value={custom_nutr[nutr_type]} class="w-[65px] border" placeholder="" step="{1}" />
                    </td>
                    {/each}
                </tr>
                <button class="btn btn-primary mt-2" on:click={recalculate_nutrition}>Recalculate Nutrition</button>
            {/if}
        </tbody>
    </table>
</div>

<style>
    td, th {
        text-align: center;
        border: 1px solid #222;
        padding: 8px;
    }
    .tooltip::before {
        white-space: break-spaces;
        font-size: 85%;
        line-height: 120%;
        max-width: 200px;
    }
</style>
<script lang="ts">
	import TextInput from "@/TextInput.svelte";
    import NumInput from "@/NumInput.svelte";
    import {Recipe, Ingredient, Instruction} from "$lib/root"
    import {debounce} from "$lib/debounce"
	import { pb, uaccount } from "$lib/pocketbase";
    import { onDestroy, onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast'
	import AutoTextArea from "@/AutoTextArea.svelte";
	import RecipeToolbar from "@/RecipeToolbar.svelte";
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";

    export let data;
    let recipeid = data.recipeid;
    let recipe: Recipe = new Recipe()

    let show_raw_ingredients = false;
    let raw_ingredients = "";

    let show_raw_instructions = false;
    let raw_instructions = "";

    const toggle_raw_ingredients = () => {
        if (!show_raw_ingredients) {
            raw_ingredients = regen_raw_ingredients()
        } else {
            recipe.ingredients = recipe.txt_to_ingredients(raw_ingredients)
        }
        show_raw_ingredients = !show_raw_ingredients
    }
    const regen_raw_ingredients = (): string => {
        console.log(recipe)
        return recipe.ingredients_to_txt()
    }

    const toggle_raw_instructions = () => {
        if (!show_raw_instructions) {
            raw_instructions = regen_raw_instructions()
        } else {
            recipe.instructions = recipe.txt_to_instructions(raw_instructions)
        }
        show_raw_instructions = !show_raw_instructions
    }
    const regen_raw_instructions = (): string => {
        console.log(recipe)
        return recipe.instructions_to_txt()
    }


    const add_ingredient = () => {
        recipe.ingredients = [...recipe.ingredients, new Ingredient()]
    }
    const add_instruction = () => {
        recipe.instructions = [...recipe.instructions, new Instruction()]
    }
    const save_recipe = async () => {
        if(!$uaccount) return
        if (show_raw_ingredients) recipe.ingredients = recipe.txt_to_ingredients(raw_ingredients)
        if (show_raw_instructions) recipe.instructions = recipe.txt_to_instructions(raw_instructions)

        recipe.uid = $uaccount.id
        console.log(recipe)
        if (!pb.authStore.model || !pb.authStore.model.id) {
            throw Error("Unable to update api key, login error.")
        }
        if (recipe.id != "") {
            recipe = new Recipe(await pb.collection("recipes").update(recipe.id, recipe))
        } else {
            recipe = new Recipe(await pb.collection("recipes").create(recipe))
            const url = new URL(window.location.origin.toString() + `/recipe/${recipe.id}/edit`)
            history.pushState({}, '', url);
        }
        toast.push("Saved Recipe!", {classes: ["success"]})
    }
    let save_debounce = debounce(save_recipe, 2000, 0)
    const try_save_recipe = () => {
        save_debounce()
        console.log("SAVEW")
    }

    let pic_files: any;
    const upload_pic = async () => {
        const recipe_form = new FormData()
        recipe_form.append('pics', pic_files[0]);


        // upload and create new record
        recipe = new Recipe(await pb.collection("recipes").update(recipe.id, recipe_form))
    }

    const delete_pic = async (pic: any) => {
        recipe = new Recipe(await pb.collection("recipes").update(recipe.id, {'pics-': [pic]}))
    }

    const rearrange_instructions = (i, e) => {
        let newi = parseInt(e.target.value)
        if (isNaN(newi)) return;
        newi--;
        if (recipe === undefined) return;
        // Blur input
        e.target.blur();
        // Rearranges instruction array
        recipe.instructions.splice(newi, 0, recipe.instructions.splice(i, 1)[0]);
        recipe.instructions = [...recipe.instructions]
        // Save updates
        try_save_recipe();
    }
    const rearrange_pics = (i, e) => {
        let newi = parseInt(e.target.value)
        if (isNaN(newi) || !recipe.pics) return;
        newi--;
        if (recipe === undefined) return;
        // Blur input
        e.target.blur();
        // Rearranges instruction array
        recipe.pics.splice(newi, 0, recipe.pics.splice(i, 1)[0]);
        recipe.pics = [...recipe.pics]
        // Save updates
        try_save_recipe();
    }

    onMount(async () => {
        console.log(recipeid)
        if (recipeid == undefined || recipeid == "") {
            recipe = new Recipe()
            add_ingredient()
            add_instruction()
        } else {
            recipe = new Recipe(await pb.collection("recipes").getOne(recipeid))
            if (recipe.uid != $uaccount.id) goto("/")
        }
        raw_ingredients = regen_raw_ingredients()
        raw_instructions = regen_raw_instructions()
    });

    onDestroy(() => {
        save_recipe()
    })
</script>

<div> 
    {#if recipe}
        <div class="flex justify-center mb-10">
            <input type="text" placeholder="Recipe Name" bind:value="{recipe.title}" class="input m-auto w-[800px] max-w-[96%] text-[28pt] text-center p-8" on:input="{try_save_recipe}"/>
        </div>
        <div class="flex justify-center space-x-8 mb-5">
            <NumInput placeholder="# of Servings" bind:value="{recipe.servings}" on:input="{try_save_recipe}" class="w-24" noarrows alwaysfloatplaceholder />
            <NumInput placeholder="Active Time" bind:value="{recipe.active_time}" on:input="{try_save_recipe}" class="w-24" noarrows alwaysfloatplaceholder />
            <NumInput placeholder="Total Time" bind:value="{recipe.total_time}" on:input="{try_save_recipe}" class="w-24" noarrows alwaysfloatplaceholder />
        </div>
        <div class="flex justify-center mb-10">
            <TextInput placeholder="Original Recipe URL" bind:value="{recipe.og_url}" class="w-[500px] input-xs" on:input="{try_save_recipe}" />
        </div>
        <hr>
        {#if recipe.pics && recipe.pics.length > 0}
            <div class="flex justify-center my-10 space-x-4">
                    {#each recipe.pics as pic, i (pic)}
                        <figure class="h-[250px] relative">
                            <div class="absolute top-0 right-0 p-2 bg-base-200 border border-base-300 rounded-bl-xl rounded-tr-xl">
                                #<input type="number" min="1" value="{i + 1}" class="instruction-order-input bg-base-200" on:input="{(e) => rearrange_pics(i, e)}" />
                            </div>
                            <div class="absolute -bottom-0.5 right-0 p-2 bg-error rounded-tl-xl rounded-br-xl">
                                <button on:click="{() => delete_pic(pic)}"><Icon icon="tabler:trash"/></button>
                            </div>
                            <img src="{pb.files.getUrl(recipe, pic, {'thumb': '250x250'})}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow"/>
                        </figure>
                    {/each}
            </div>
        {/if}
        <div class="flex justify-center m-5">
            <div class="form-control w-full max-w-xs">
                <label class="label">
                  <span class="label-text">Add a photo:</span>
                </label>
                <input type="file" class="file-input-sm file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg;capture=camera" bind:files="{pic_files}" on:change="{upload_pic}"/>
            </div>
        </div>
        <hr>
        <RecipeToolbar recipe="{recipe}" editing/>
        <hr>
        <div>
            <div class="flex justify-around flex-wrap">
                <div class="recipe-section text-center">
                    <h1 class="my-5">Ingredients</h1>
                    <button class="italic text-blue-500 underline" on:click="{toggle_raw_ingredients}">Show {show_raw_ingredients ? "WYSIWG" : "Raw"}</button>
                    <hr class="my-5">
                    {#if show_raw_ingredients}
                        <AutoTextArea bind:value="{raw_ingredients}" class="ingredient-notes-input w-full" on:input="{try_save_recipe}"/>
                    {:else}
                        {#each recipe.ingredients as ingred, i}
                            <div class="mb-4">
                                <div class="flex justify-center">
                                    <input bind:value="{ingred.quantity}" class="input w-[60px] h-8 text-center" noarrows on:input="{try_save_recipe}" />
                                    <input type="text" bind:value="{ingred.unit}" class="input w-[100px] h-8 text-center" placeholder="Unit" on:input="{try_save_recipe}" />
                                    <input bind:value="{ingred.ingredient}" class="input text-center h-8 ingredient-ingredient-input" on:input="{try_save_recipe}" placeholder="Ingredient Name (bksp to clear)" v-on:keyup.delete="e => check_empty_ingredient(e, ingredIndex)" />
                                    <br />
                                </div>
                                <textarea bind:value="{ingred.notes}" class="ingredient-notes-input p-1" placeholder="Notes" rows="1" auto-grow />
                            </div>
                        {/each}
                        <button class="btn btn-info" on:click="{add_ingredient}">
                            Add Ingredient
                        </button>
                    {/if}
                </div>
                <div class="recipe-section text-center">
                    <h1 class="my-5">Instructions</h1>
                    <button class="italic text-blue-500 underline" on:click="{toggle_raw_instructions}">Show {show_raw_instructions ? "WYSIWG" : "Raw"}</button>
                    <hr class="my-5">
                    {#if show_raw_instructions}
                        <AutoTextArea bind:value="{raw_instructions}" class="ingredient-notes-input w-full" on:input="{try_save_recipe}"/>
                    {:else}
                        {#each recipe.instructions as instruct, i (instruct)}
                            <div>
                                <div class="instruction-order h-[40px]">
                                    <b>#</b>
                                    <input type="number" min="1" value="{i + 1}" class="instruction-order-input bg-base-200" on:input="{(e) => rearrange_instructions(i, e)}" />
                                </div>
                                <div class="instruction-order mr-2 h-[40px]">
                                    <!--Opt: <input type="checkbox" class="checkbox"/>-->
                                    <button class="btn btn-xs" on:click="{() => {instruct.optional = !instruct.optional}}">{instruct.optional ? 'Optional' : 'Required'}</button>
                                </div>
                                <textarea bind:value="{instruct.instruction}" auto-grow rows="2" class="instruction-instruction-textarea p-4 w-full" placeholder="Instructions..." v-on:keyup.delete="e => check_empty_instruction(e, instructionIndex)" />
                            </div>
                        {/each}
                        <v-btn on:click="{add_instruction}" class="btn btn-info">
                            Add Instruction
                        </v-btn>
                    {/if}
                </div>
            </div>
            <hr>
            <div class="text-center p-5">
                <button on:click="{save_recipe}" class="btn btn-primary">Save</button>
            </div>
        </div>
    {:else}

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

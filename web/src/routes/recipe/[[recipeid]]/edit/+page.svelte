<script lang="ts">
	import TextInput from "$lib/input/TextInput.svelte";
    import NumInput from "$lib/input/NumInput.svelte";
    import {Recipe, Ingredient, Instruction, txt_to_ingredients, txt_to_instructions} from "$lib/root"
    import {debounce} from "$lib/debounce"
	import { pb, uaccount } from "$lib/pocketbase";
    import { onDestroy, onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast'
	import AutoTextArea from "$lib/AutoTextArea/AutoTextArea.svelte";
	import RecipeToolbar from "$lib/RecipeToolbar.svelte";
    import Gallery from "$lib/gallery/Gallery.svelte";
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import TagEditor from "$lib/TagEditor.svelte";
	import Nutrition from "$lib/Nutrition.svelte";
	import NutritionCalc from "$lib/NutritionCalc.svelte";

    export let data;
    let recipeid = data.recipeid;
    let recipe: Recipe;

    let raweditor: boolean = $page.url.searchParams.get("raweditor")
    let show_raw_ingredients = true //!(recipeid && recipeid != "") || raweditor;
    let raw_ingredients = "";

    let show_raw_instructions = !(recipeid && recipeid != "") || raweditor;
    let raw_instructions = "";

    let show_nutr_calc = false;

    const toggle_raw_ingredients = () => {
        if (!show_raw_ingredients) {
            raw_ingredients = regen_raw_ingredients()
        } else {
            recipe.ingredients = txt_to_ingredients(raw_ingredients)
        }
        show_raw_ingredients = !show_raw_ingredients
    }
    const regen_raw_ingredients = (): string => {
        return recipe.ingredients_to_txt()
    }

    const toggle_raw_instructions = () => {
        if (!show_raw_instructions) {
            raw_instructions = regen_raw_instructions()
        } else {
            recipe.instructions = txt_to_instructions(raw_instructions)
        }
        show_raw_instructions = !show_raw_instructions
    }
    const regen_raw_instructions = (): string => {
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
        if (show_raw_ingredients) recipe.ingredients = txt_to_ingredients(raw_ingredients)
        if (show_raw_instructions) recipe.instructions = txt_to_instructions(raw_instructions)

        //Don't save empty recipes
        if (!(recipe.ingredients.length > 0 || recipe.instructions.length > 0)) return

        recipe.uid = $uaccount.id
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
    let save_debounce = debounce(save_recipe, recipeid && recipeid != "" ? 2500 : 1500, 0)
    const try_save_recipe = () => {
        save_debounce()
    }

    let show_photo_editor = true;
    let pic_files: any;
    const upload_pic = async () => {
        const recipe_form = new FormData()
        recipe_form.append('pics', pic_files[0]);


        // upload and create new record
        recipe = new Recipe(await pb.collection("recipes").update(recipe.id, recipe_form))
    }
    let add_pic_url = "";
    const add_pic_by_url = () => {
        const valid_img_url_regex = /^https?:\/\/\S+\.((jpg|jpeg|png|gif|bmp|svg|webp|tiff|ico)(\?.*)?)$/i
        if (add_pic_url.match(valid_img_url_regex)) {
            recipe.pic_urls = [...recipe.pic_urls, add_pic_url]
            add_pic_url = ""
            try_save_recipe()
        } else {
            toast.push("Failed to add image, invalid URL")
        }
        
    }

    const rearrange_instructions = (i: number, e: Event) => {
        const etarget = e.target as any
        let newi = parseInt(etarget.value)
        if (isNaN(newi)) return;
        newi--;
        if (recipe === undefined) return;
        // Blur input
        etarget.blur();
        // Rearranges instruction array
        recipe.instructions.splice(newi, 0, recipe.instructions.splice(i, 1)[0]);
        recipe.instructions = [...recipe.instructions]
        // Save updates
        try_save_recipe();
    }

    const ingredient_delete_watch = (i: number, e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (recipe.ingredients[i].ingredient == "") {
                recipe.ingredients.splice(i, 1);
                recipe.ingredients = [...recipe.ingredients]
            }
        }
    }
    const instruction_delete_watch = (i: number, e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (recipe.instructions[i].instruction == "") {
                recipe.instructions.splice(i, 1);
                recipe.instructions = [...recipe.instructions]
            }
        }
    }

    onMount(async () => {
        if (recipeid == undefined || recipeid == "") {
            recipe = new Recipe()
            add_ingredient()
            add_instruction()
        } else {
            recipe = new Recipe(await pb.collection("recipes").getOne(recipeid).catch((r) => {
                    toast.push("Error loading recipe, returning to home page...")
                    setTimeout(() => {
                        goto("/")
                    }, 3000)
                    return r
            }))
            if ($uaccount && recipe.uid != $uaccount.id) goto("/")
        }
        raw_ingredients = regen_raw_ingredients()
        raw_instructions = regen_raw_instructions()
        show_photo_editor = !(recipe.pics.length + recipe.pic_urls.length > 0)
    });

    onDestroy(() => {
        save_recipe()
    })
</script>

<svelte:window on:beforeunload={save_recipe} />
<svelte:head>
    <title>{recipe && recipe.title ? `${recipe.title} - ` : ""}Root Cellar</title> 
</svelte:head>

<div> 
    {#if recipe}
        <div class="flex justify-center mb-5">
            <input type="text" placeholder="Recipe Name" bind:value="{recipe.title}" class="input m-auto w-[800px] max-w-[96%] text-[28pt] text-center p-8" on:input="{try_save_recipe}"/>
        </div>
        <div class="max-w-[80%] mx-auto mb-8">
            <AutoTextArea bind:value="{recipe.description}" placeholder="Description" on:input="{try_save_recipe}"/>
        </div>
        <div class="max-w-[80%] mx-auto mb-8">
            <TagEditor bind:recipe="{recipe}" on:save="{try_save_recipe}" class="z-1000"/>
        </div>
        <div class="flex justify-center space-x-8 m-5">
            <NumInput placeholder="Active Time" bind:value="{recipe.active_time}" on:input="{try_save_recipe}" class="w-24" noarrows alwaysfloatplaceholder />
            <NumInput placeholder="Total Time" bind:value="{recipe.total_time}" on:input="{try_save_recipe}" class="w-24" noarrows alwaysfloatplaceholder />
        </div>
        <div class="flex justify-center mb-10">
            <TextInput placeholder="Original Recipe URL" bind:value="{recipe.og_url}" class="w-[500px] input-xs" on:input="{try_save_recipe}" />
        </div>
        <hr>
        <div class="card shadow p-2 bg-base-100">
            <div class="text-xl text-center font-medium cursor-pointer {show_photo_editor ? 'border-b border-b-base-300 pb-2' : ''}" on:click="{() => show_photo_editor = !show_photo_editor}">
                Photo Editor
                <div class="float-right">
                    {show_photo_editor ? '-' :  '+'}
                </div>
            </div>
            <div class="{show_photo_editor ? 'max-h-[1000px]' : 'max-h-[0px]'} overflow-hidden" style="transition: max-height 0.2s;">
                <Gallery recipe="{recipe}" editable="{true}" on:save="{try_save_recipe}"/>
                <div class="flex justify-center flex-wrap">
                    <div class="flex justify-center m-5">
                        <div class="form-control w-full max-w-xs">
                            <label class="label">
                            <span class="label-text">Add a photo:</span>
                            </label>
                            <input type="file" class="file-input-sm file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg;capture=camera" bind:files="{pic_files}" on:change="{upload_pic}"/>
                        </div>
                    </div>
                    <div class="flex justify-center mb-5">
                        <div class="form-control w-full max-w-xs">
                            <label class="label">
                            <span class="label-text">Add photo by URL:</span>
                            </label>
                            <input type="text" class="file-input file-input-sm bordered" bind:value="{add_pic_url}" /> 
                            <button class="btn btn-xs btn-info" on:click="{add_pic_by_url}">Add URL</button>
                        </div>
                    </div>
                </div>
            </div>  
        </div>
        <hr>
        <RecipeToolbar recipe="{recipe}" editing/>
        <hr>
        <div class="flex justify-center flex-wrap">
            <div class="flex flex-col">
                <Nutrition recipe="{recipe}" editable="{true}" on:input="{try_save_recipe}"/>
                <div class="italic text-center">
                    Note: all nutrition data is estimated.
                    <br>
                    <a class="link" on:click="{() => {show_nutr_calc = !show_nutr_calc}}">Click to {show_nutr_calc ? "hide" : "show"} nutrition calculator (beta)</a>
                </div>
            </div>
            {#if show_nutr_calc}
                <div class="bg-base-300 p-4 rounded-lg overflow-auto max-w-[100vw] ">
                    <NutritionCalc bind:recipe="{recipe}"/>
                </div>
            {/if}
        </div>
        <hr>
        <div>
            <div class="flex justify-around flex-wrap">
                <div class="recipe-section text-center">
                    <h1 class="my-5">Ingredients</h1>
                    <button class="italic text-blue-500 underline" on:click="{toggle_raw_ingredients}">Show {show_raw_ingredients ? "WYSIWG" : "Raw"}</button>
                    <hr class="my-5">
                    {#if show_raw_ingredients}
                        <AutoTextArea bind:value="{raw_ingredients}" on:input="{try_save_recipe}"/>
                        <div class="italic my-2 text-sm">
                            Note: Please separate each ingredient by a new line
                        </div>
                    {:else}
                        {#each recipe.ingredients as ingred, i}
                            <div class="mb-4">
                                <div class="flex justify-center">
                                    <input bind:value="{ingred.quantity}" class="input w-[60px] h-8 text-center" on:input="{try_save_recipe}" />
                                    <input type="text" bind:value="{ingred.unit}" class="input w-[100px] h-8 text-center" placeholder="Unit" on:input="{try_save_recipe}" />
                                    <input bind:value="{ingred.ingredient}" class="input text-center h-8 ingredient-ingredient-input" on:input="{try_save_recipe}" placeholder="Ingredient Name (bksp to clear)" v-on:keyup.delete="e => check_empty_ingredient(e, ingredIndex)" />
                                    <br />
                                </div>
                                <div class="flex justify-center">
                                    <div class=" w-[440px]">
                                        <AutoTextArea bind:value="{ingred.notes}" placeholder="Notes" on:input="{try_save_recipe}"/>
                                    </div>
                                </div>
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
                        <div class="italic my-2 text-sm">
                            Note: Please separate each instruction by a new line
                        </div>
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
                                <AutoTextArea bind:value="{instruct.instruction}" placeholder="Instructions..." class="ingredient-notes-input p-1" on:keyup="{(e) => { instruction_delete_watch(i, e) }}" on:input="{try_save_recipe}"/>
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
        <div class="flex justify-center">
            <div class="flex justify-center flex-col text-center">
                <h1 class="h1 my-5">Loading Recipe...</h1>
                <progress class="progress w-56"></progress>
            </div>
        </div>
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
	width: 280px;
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

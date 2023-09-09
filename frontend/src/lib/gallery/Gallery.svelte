<script lang="ts">
import { pb, uaccount } from "$lib/pocketbase";
import { Recipe } from "$lib/root"
import Icon from "@iconify/svelte";
import { createEventDispatcher } from "svelte";
import { Lightbox } from 'svelte-lightbox';

export let recipe: Recipe; 
export let editable: boolean;

const rearrange_pics = (i: number, e: Event) => {
    const etarget = e.target as any
    let newi = parseInt(etarget.value)
    if (isNaN(newi) || !recipe.pics) return;
    newi--;
    if (recipe === undefined) return;
    // Blur input
    etarget.blur();
    // Rearranges instruction array
    recipe.pics.splice(newi, 0, recipe.pics.splice(i, 1)[0]);
    recipe.pics = [...recipe.pics]
    // Save updates
    const dispatch = createEventDispatcher()
    dispatch("save")
}
const delete_pic = async (pic: any) => {
    recipe = new Recipe(await pb.collection("recipes").update(recipe.id, {'pics-': [pic]}))
}
const delete_pic_url = async (pic_url: any) => {
    console.log(pic_url)
    recipe.pic_urls = recipe.pic_urls.filter((x) => x != pic_url)
    recipe.pic_urls = [...recipe.pic_urls]
    recipe = new Recipe(await pb.collection("recipes").update(recipe.id, {pic_urls: recipe.pic_urls}))
}


let lightbox_controller: any;
let lightbox_pic: string | undefined;

const open_lightbox = (pic: string) => {
    lightbox_pic = pic
    console.log(lightbox_controller)
    lightbox_controller.open()
}
const close_lightbox = () => {
    lightbox_controller.close()
    lightbox_pic = ""
}
const joined_pic_urls = (url_entity) => {
    const x = (recipe.pics || [])
        .map((pic) => pb.files.getUrl(recipe, pic, {'thumb': '250x250'}))
        .concat(recipe.pic_urls)
        .filter((x: string) => x.trim() != "")
    console.log(x)
    return x
}

</script>

<div>
    {#if recipe && joined_pic_urls().length > 0}
        <div class="flex justify-center my-10 space-x-4">
            {#each joined_pic_urls() as pic, i (pic)}
                <figure class="h-[250px] relative">
                    {#if editable}
                        {#if i < recipe.pics.length}
                            <div class="absolute top-0 right-0 p-2 bg-base-200 border border-base-300 rounded-bl-xl rounded-tr-xl">
                                #<input type="number" min="1" value="{i + 1}" class="w-[30px] text-center bg-base-200 nonumarrow" on:input="{(e) => rearrange_pics(i, e)}" />
                            </div>
                        {/if}
                        <div class="absolute -bottom-0.5 right-0 p-2 bg-error rounded-tl-xl rounded-br-xl">
                            <button on:click="{() => {if (i < recipe.pics.length) { delete_pic(recipe.pics[i]) } else { delete_pic_url(pic) }}}"><Icon icon="tabler:trash"/></button>
                        </div>
                    {/if}
                    <img src="{pic}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow w-[250px] h-[250px]" on:click="{() => {open_lightbox(pic)}}"/>
                </figure>
            {/each}
        </div>
        <Lightbox bind:programmaticController="{lightbox_controller}" enableFallbackThumbnail={false} transitionDuration="{100}" imagePreset="fullscreen" enableClickToClose> 
            {#if lightbox_pic} 
                <img src="{lightbox_pic}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow max-h-full max-v-full"/>
            {/if}
        </Lightbox>
    {/if}
</div>


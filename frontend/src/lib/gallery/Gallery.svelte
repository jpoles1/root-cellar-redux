<script lang="ts">
import { pb, uaccount } from "$lib/pocketbase";
import type { Recipe } from "$lib/root"
import Icon from "@iconify/svelte";
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
    try_save_recipe();
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

</script>

<div>
    {#if recipe && recipe.pics && recipe.pics.length > 0}
        <div class="flex justify-center my-10 space-x-4">
            {#each recipe.pics as pic, i (pic)}
                <figure class="h-[250px] relative" on:click="{() => {open_lightbox(pic)}}">
                    {#if editable}
                        <div class="absolute top-0 right-0 p-2 bg-base-200 border border-base-300 rounded-bl-xl rounded-tr-xl">
                            #<input type="number" min="1" value="{i + 1}" class="w-[30px] text-center bg-base-200 nonumarrow" on:input="{(e) => rearrange_pics(i, e)}" />
                        </div>
                        <div class="absolute -bottom-0.5 right-0 p-2 bg-error rounded-tl-xl rounded-br-xl">
                            <button on:click="{() => delete_pic(pic)}"><Icon icon="tabler:trash"/></button>
                        </div>
                    {/if}
                    <img src="{pb.files.getUrl(recipe, pic, {'thumb': '250x250'})}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow"/>
                </figure>
            {/each}
        </div>
        <Lightbox bind:programmaticController="{lightbox_controller}" enableFallbackThumbnail={false} transitionDuration="{100}" imagePreset="fullscreen" enableClickToClose> 
            {#if lightbox_pic} 
                <img src="{pb.files.getUrl(recipe, lightbox_pic)}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow max-h-full max-v-full"/>
            {/if}
        </Lightbox>
    {/if}
</div>


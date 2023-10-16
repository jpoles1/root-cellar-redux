<script lang="ts">
	import JsonView from "$lib/JsonView.svelte";
	import { debounce } from "$lib/debounce.js";
import { pb, uaccount } from "$lib/pocketbase";
	import Icon from "@iconify/svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";
 
    export let data;

    let url_uid = data.uid || undefined
    let udata =  $uaccount

    onMount(async () => {
        if (url_uid && ($uaccount && ($uaccount.id == url_uid || $uaccount.admin))) {
            udata = await pb.collection("users").getOne(url_uid)
        }
    })

    let pic_files: any;
    const upload_avatar = async () => {
        const user_form = new FormData()
        user_form.append('avatar', pic_files[0]);

        const new_udata = await pb.collection("users").update(udata!.id, user_form).catch((e) => {
            toast.push(`Failed to update user record: ${e}`)
        })
        if (new_udata) {
            udata = new_udata
            toast.push("User record updated")
        }
        // upload and create new record
        //recipe = new Recipe(await pb.collection("recipes").update(recipe.id, recipe_form))
    }
    const delte_avatar = async () => {
        if (!confirm("Are you sure you want to delete your avatar?")) return
        const new_udata = await pb.collection("users").update(udata!.id, {avatar: null}).catch((e) => {
            toast.push(`Failed to update user record: ${e}`)
        })
        if (new_udata) {
            udata = new_udata
            toast.push("User record updated")
        }
    }

    const save_user = async () => {
        const new_udata = await pb.collection("users").update(udata!.id, udata!).catch((e) => {
            toast.push(`Failed to update user record: ${e}`)
        })
        if (new_udata) {
            udata = new_udata
            toast.push("User record updated")
        }
    }
    const save_user_debounce = debounce(save_user, 0, 500)
    const try_save_user = () => {
        if (udata) {
            save_user_debounce()
        }
    }
</script>

<svelte:head>
    <title>User Profile - Root Cellar</title> 
</svelte:head>

<div class="m-auto w-[500px] bg-info p-4 card shadow">
    {#if $uaccount && udata}
        <h1 class="h1 my-4">User Data</h1>
        <hr>
        <div class="flex flex-col justify-center items-center m-5">
            {#if udata.avatar}
                <div class="relative">
                    <div class="absolute -bottom-0.5 right-0 p-2 bg-error rounded-tl-xl rounded-br-xl">
                        <button on:click="{delte_avatar}"><Icon icon="tabler:trash"/></button>
                    </div>
                    <img src="{pb.files.getUrl(udata, udata.avatar, {'thumb': '250x250'})}" alt="Recipe Photo" class="rounded-xl border border-base-3 shadow w-[150px] h-[150px]"/>
                </div>
            {/if}
            <div class="form-control w-full max-w-xs">
                <label class="label">
                    <span class="label-text">Add an avatar:</span>
                </label>
                <input type="file" class="file-input-sm file-input file-input-bordered w-[280px] max-w-xs" accept="image/png, image/jpeg;capture=camera" bind:files="{pic_files}" on:change="{upload_avatar}"/>
            </div>
        </div>
        <hr>
        {#if $uaccount.admin}
        <div class="form-control">
             <div class="label">
                <div class="label-text">Admin:</div>
                <input type="checkbox" class="checkbox" bind:checked={udata.admin} />
            </div>
        </div>
        <hr>
        {/if}
        <div class="form-control">
            <div class="label">
                <div class="label-text">Username:</div>
            </div>
            <input type="text" class="input" bind:value="{udata.username}"/>
        </div>
        <br>
        <hr>
        <div>
            <button class="btn btn-primary" on:click={try_save_user}>Save</button>
        </div>
    {/if}
</div>
<script lang="ts">
	import { pb, uaccount } from "$lib/pocketbase";
    import Icon from "@iconify/svelte";
    import { toast } from '@zerodevx/svelte-toast'

    let oai_key = $uaccount ? $uaccount.oai_key : ""
    let key_entry_visible = false;

    const save_api_key = async () => {
        console.log(oai_key)
        if (!pb.authStore.model || !pb.authStore.model.id) {
            throw Error("Unable to update api key, login error.")
        }
        await pb.collection("users").update(pb.authStore.model.id, { oai_key })
        toast.push("Saved API Key!", {classes: ["success"]})
    }
    const clear_api_key = async () => {
        oai_key = ""
        save_api_key()
    }
</script>

<div class="rounded-lg bg-base-200 p-5 m-5">
    <label>
        OpenAI API Key:
        <br>
        <div class="flex">
            {#if key_entry_visible}
                <input type="text" class="p-2 rounded-md flex-grow" bind:value="{oai_key}"/>
            {:else}
                <input type="password" class="p-2 rounded-md flex-grow" bind:value="{oai_key}" autocomplete="off"/>
            {/if}
            <button class="btn" on:click="{() => key_entry_visible = !key_entry_visible}">
                <Icon icon="mdi:eye"/>
            </button>
        </div>
    </label>
    <br>
    <button class="btn" on:click={save_api_key}>Save</button>
    <button class="btn" on:click={clear_api_key}>Clear</button>
</div>
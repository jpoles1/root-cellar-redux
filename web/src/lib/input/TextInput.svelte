<script lang="ts">
    export let placeholder: string;
    export let value: string;
    export let disabled: boolean = false;
    export let nofloatplaceholder: boolean = false;
    export let alwaysfloatplaceholder: boolean = false;
</script>

<div class="form-control relative {$$props.class || ''}">
    <input type="text" placeholder="{placeholder}" disabled="{disabled}" bind:value="{value}" class="input input-sm {nofloatplaceholder ? '' : 'placeholder-transparent'} peer" on:input on:change on:keydown on:keyup>
    {#if !nofloatplaceholder}
        {#if alwaysfloatplaceholder}
            <label class="label absolute left-4 pointer-events-none transition-all text-base-content text-opacity-50 -top-6 text-xs text-sm bg-transparent">
                {placeholder}
            </label> 
        {:else}
            <label class="label absolute left-4 pointer-events-none transition-all text-base-content text-opacity-50 -top-6 peer-placeholder-shown:-top-1 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent">
                {placeholder}
            </label> 
        {/if}
    {/if}
</div>

<style>
    .input:disabled, .input[disabled] {
        cursor: text;
    }
    .input-sm {
        height: 1.5rem
    }
</style>
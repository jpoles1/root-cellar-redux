<script lang="ts">
    export let placeholder: string;
    export let value: string;
    export let disabled: boolean;
    export let noarrows: boolean;
    export let nofloatplaceholder: boolean;
    export let alwaysfloatplaceholder: boolean;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="form-control relative {$$props.class || ''} {noarrows ? 'nonumarrow' : ''}">
    <input type="number" placeholder="{placeholder || ''}" disabled="{disabled}" bind:value="{value}" class="input input-sm {nofloatplaceholder ? '' : 'placeholder-transparent'} peer" on:input="{(e) => dispatch("input", e)}">
    {#if !nofloatplaceholder}
        {#if alwaysfloatplaceholder}
            <label class="label absolute left-4 pointer-events-none transition-all text-base-content text-opacity-50 -top-7 text-xs text-sm bg-transparent">
                {placeholder}
            </label> 
        {:else}
            <label class="label absolute left-4 pointer-events-none transition-all text-base-content text-opacity-50 -top-6 peer-placeholder-shown:top-0 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent">
                {placeholder}
            </label> 
        {/if}
    {/if}
</div>

<style>
    .nonumarrow input[type=number]::-webkit-inner-spin-button, 
    .nonumarrow input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
    }
    .nonumarrow input[type=number] {
        -moz-appearance: textfield;
    }
</style>
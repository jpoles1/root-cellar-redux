<script lang="ts">
    export let placeholder: string;
    export let value: string;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="form-control relative {$$props.class || ''}">
    <input type="text" placeholder="{placeholder}" bind:value="{value}" class="input placeholder-transparent peer" on:change="{(e) => dispatch("input", e)}">
    <label class="label absolute left-4 pointer-events-none transition-all text-base-content text-opacity-50 -top-6 peer-placeholder-shown:top-1.5 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent">
        {placeholder}
    </label> 
</div>
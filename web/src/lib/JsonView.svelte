<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
  
    export let jsondata = {};
  
    let expanded = writable({}) as any;
  
    onMount(() => {
      expanded.set({});
    });
  
    function toggleExpand(key: any) {
      expanded.update((state: any) => {
        return { ...state, [key]: !state[key] };
      });
    }
  </script>
  
  <style>
    .json-key {
      font-weight: bold;
      cursor: pointer;
    }
  </style>
  
  <div class="ml-4">
    {#if jsondata}
        {#each Object.entries(jsondata) as [key, value]}
        <div class="json-entry">
            {#if Array.isArray(value) || typeof value === 'object'}
                <span class="json-key" on:click={() => toggleExpand(key)}>
                    > {key}:
                </span>
                {#if $expanded[key]}
                    <svelte:self jsondata={value} />
                {/if}
            {:else}
                <span>
                    - {key}:
                </span>
                <span class="json-value">{value}</span>
            {/if}
        </div>
        {/each}
    {/if}
  </div>
  
<script lang="ts">
import { onDestroy } from "svelte";
import type { HTMLTextareaAttributes } from 'svelte/elements'

interface $$Props extends HTMLTextareaAttributes {
  value?: any;
  minRows?: number;
  maxRows?: number;
}

export let value = '';
export let minRows: number | undefined = 1;
export let maxRows: number | undefined = 20;

import ProxyTextareaElement from "./core";

let element: HTMLTextAreaElement | null = null;

const instance = new ProxyTextareaElement();

$: {
  if (element !== null && !instance.hasStarted) instance.start(element, minRows, maxRows);
  if (instance.hasStarted) instance.onUpdateText((value || '').toString());
}

onDestroy(() => {
  instance.cleanUp();
});
</script>

<textarea {...$$props} bind:this={element} bind:value={value} class="rounded-sm border border-black overflow-auto w-full p-2 pr-6" on:input on:change on:keydown on:keyup/>
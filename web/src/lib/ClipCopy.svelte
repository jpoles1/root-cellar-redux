<script lang="ts">
	import { onMount } from 'svelte';
	
	export let name: string;

	let textarea: HTMLElement;
	
	onMount(() => {
		textarea.select();
		document.execCommand('copy');
	});
</script>

<textarea bind:value={name} bind:this={textarea}></textarea>


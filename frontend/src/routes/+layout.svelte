<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	// Most of your app wide CSS should be put in this file
	import '../app.css';


	import Icon from '@iconify/svelte';
	import Header from './Header.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { pb } from '$lib/pocketbase'
	$: auth = pb.authStore
</script>


<div class="bg-base-200 w-full h-full flex flex-col overflow-hidden">
	<Header />
	<div class="p-5 overflow-y-auto">
		<slot/>
	</div>
	<SvelteToast options={{classes: ["toaster"], duration: 2000}} />
</div>

<style>
:root {
	--toastContainerTop: auto;
	--toastContainerRight: auto;
	--toastContainerBottom: 0;
	--toastContainerLeft: calc(50vw - 8rem);
}
:global(.toaster.success) {
	--toastColor: hsl(var(--suc));
	--toastBackground: hsl(var(--su));
	--toastBarBackground: hsl(var(--suc));
	font-weight: bold;
}

:global(.toaster.info) {
	--toastColor: hsl(var(--inc));
	--toastBackground: hsl(var(--in));
	--toastBarBackground: hsl(var(--inc));
	font-weight: bold;
}

:global(.toaster.warn) {
	--toastColor: hsl(var(--wac));
	--toastBackground: hsl(var(--wa));
	--toastBarBackground: hsl(var(--wac));
	font-weight: bold;
}
:global(.toaster.error) {
	--toastColor: hsl(var(--erc));
	--toastBackground: hsl(var(--er));
	--toastBarBackground: hsl(var(--erc));
	font-weight: bold;
}
</style>
<script lang="ts">
    import { uaccount } from "$lib/pocketbase";
	import Icon from '@iconify/svelte';
</script>

<div class="bg-base-300 p-2 flex justify-between align-middle">
    <div>
    </div>
    <div class="flex items-center"> 
        <a href="/" data-sveltekit-reload><h1>Root Cellar</h1></a>
    </div>
    <div class="flex space-x-4">   
        {#if !$uaccount}
            <a class="btn btn-sm" href="/login">Login</a>
        {:else}
            <a href="/recipe/edit" class="btn btn-sm">   
                <Icon icon="typcn:plus" /> Recipe
            </a>
            <a class="btn btn-sm" href="/logout">Logout</a>
        {/if}
    </div>
</div>

<style lang="postcss">
    .animate-lowcash {
        animation: lowcash 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        @keyframes lowcash {
            50% {
                background-color: #372f03;
                transform: scale(1.01);
                opacity: 0.8;
            }
        }
    }
    .animate-outofcash {
        animation: outofcash 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        @keyframes outofcash {
            50% {
                background-color: #371803;
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
    }
    
</style>
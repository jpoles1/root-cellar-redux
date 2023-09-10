<script lang="ts">
    import { uaccount } from "$lib/pocketbase";
	import Icon from '@iconify/svelte';
</script>

<div class="bg-base-300 p-2 flex justify-between align-middle relative">
    <div>
        <div class="dropdown hidden max-md:block z-10">
            <label class="btn btn-ghost btn-circle" tabindex="-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </label>
            <ul tabindex="-2" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                {#if !$uaccount}
                    <a class="btn btn-sm" href="/login" data-sveltekit-reload>
                        Login
                    </a>
                {:else}
                    <a href="/recipe/edit" class="btn btn-sm" data-sveltekit-reload>   
                        <Icon icon="typcn:plus" /> Recipe
                    </a>
                    <a href="/recipe/webimport" class="btn btn-sm" data-sveltekit-reload>   
                        <Icon icon="typcn:camera" /> Import
                    </a>
                    <a class="btn btn-sm" href="/logout" data-sveltekit-reload>
                        Logout
                    </a>
                {/if}
            </ul>
        </div>
    </div>
    <div class="absolute text-center w-full -z-1">
        <div class="w-fit m-auto">
            <a href="/" data-sveltekit-reload>
                <h1>Root Cellar</h1>  
            </a>
        </div>
    </div>
    <div class="flex space-x-4 max-md:hidden z-10">   
        {#if !$uaccount}
            <a class="btn btn-sm" href="/login">Login</a>
        {:else}
            <a href="/recipe/edit" class="btn btn-sm" data-sveltekit-reload>   
                <Icon icon="typcn:plus" /> Recipe
            </a>
            <a href="/recipe/webimport" class="btn btn-sm">   
                <Icon icon="typcn:camera" /> Import
            </a>
            <a class="btn btn-sm" href="/logout">Logout</a>
        {/if}
    </div>
</div>
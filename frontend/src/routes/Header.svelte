<script lang="ts">
    import { uaccount } from "$lib/pocketbase";
	import Icon from '@iconify/svelte';
</script>

<div class="bg-base-300 min-h-6 p-2 flex justify-between align-middle">
    <div>
    </div>
    <div class="flex items-center"> 
        <a href="/"><h1>Root Cellar</h1></a>
    </div>
    <div class="flex space-x-4">   
        {#if !$uaccount}
            <a class="btn" href="/login">Login</a>
        {:else}
            {#if $uaccount.oai_key && $uaccount.oai_key.length > 0 }
                <a href="/addcoins" class="btn">   
                    OpenAI <Icon icon="zondicons:key" class="text-yellow-300"/>
                </a>
            {:else}
                <a href="/addcoins" class="btn {$uaccount.coins == 0 ? "animate-outofcash" : ($uaccount.coins < 10 ? "animate-lowcash" : "") }">   
                    {$uaccount.coins} <Icon icon="akar-icons:coin" class="text-yellow-300"/>
                </a>
            {/if}
            <a class="btn" href="/logout">Logout</a>
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
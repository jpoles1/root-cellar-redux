<script lang="ts">
    import { pb } from '$lib/pocketbase'
	import { redirect } from '@sveltejs/kit';
    import {goto} from "$app/navigation"
    if (pb.authStore.isValid) {
        pb.authStore.clear();
        goto("/login")
    }

</script>

<div class="card m-auto w-[80%] text-center p-24">
    <h1 class="h1">Logging you out!</h1>
</div>
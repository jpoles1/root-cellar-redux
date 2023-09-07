<script lang="ts">
    import OaiApiEntry from "./oai_api_entry.svelte";
</script>

<div class="mx-auto p-5 rounded-xl bg-base-100 max-w-3xl">
    <h1 class="text-center">Add Coins To Your Account:</h1>
    <p>
        Right now, DocQuery is operating as a free service. You have two options if you've run out of coins and you want to keep searching:
    </p>
    <ol class="list-decimal list-inside">
        <li>Contact us at: jpdev.noreply@gmail.com and request more tickets. Please be sure to provide us with your email account you use to login.</li>
        <li>Use your own <a class="link" href="https://platform.openai.com/account/api-keys" target="_blank">OpenAI API key</a>, and we'll supply the data free of charge. To proceed, please enter your API key in the box below and click submit.</li>
    </ol>
    <OaiApiEntry />
</div>

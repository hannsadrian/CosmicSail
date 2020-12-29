<script>
    export let segments = ["Control", "Autopilot", "Tracker"];
    export let selected = "Control";

    function select(name) {
        selected = name;
    }
</script>

<div class="flex">
    <div class="flex p-1 space-x-2 rounded-lg bg-gray-300 dark:bg-gray-900">
        {#each segments as segment}
            <button on:click={select(segment)} class={(selected === segment ? "bg-gray-400 dark:bg-black" : "")+" px-3 py-1 cursor-pointer rounded"}>
                {segment}
            </button>
        {/each}
    </div>
</div>

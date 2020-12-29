<script>
    export let type = "button";
    export let text = "";
    export let className = false;
    export let onClick = null;
    export let isPrimary = false;

    let defaultClasses = "text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded-lg transition duration-150 hover:no-underline hover:bg-gray-300 dark-hover:bg-gray-900 active:bg-gray-400"
    let primaryClasses = "bg-gray-800 dark:bg-black py-2 px-4 rounded-lg text-white shadow-lg transition duration-150 hover:bg-gray-900 active:bg-black"
</script>

<button
        {type}
        on:click={onClick}
        class={(isPrimary ? primaryClasses : defaultClasses) + " " + (!!className ? className : "")}>
    {@html text}
</button>

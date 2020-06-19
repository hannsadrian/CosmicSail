<script>
  export let text = "";
  export let className = false;
  export let onClick = null;
</script>

<button
  on:click={onClick}
  class={"text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 py-2 px-4 rounded-lg transition duration-150 hover:no-underline hover:bg-gray-300 dark-hover:bg-gray-900 active:bg-gray-400 " + (!!className ? className : "")}>
  {@html text}
</button>

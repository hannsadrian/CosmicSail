<script>
  export let type = "button";
  export let text = "";
  export let className = false;
  export let onClick = null;
</script>

<button
  {type}
  on:click={onClick}
  class={"bg-gray-800 dark:bg-black py-2 px-4 rounded-lg text-white shadow-lg transition duration-150 hover:bg-gray-900 active:bg-black "+ (!!className ? className : "")}>
  {@html text}
</button>

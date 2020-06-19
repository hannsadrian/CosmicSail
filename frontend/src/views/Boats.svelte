<script>
    import {onMount} from "svelte";
    import axios from "axios";

    let boats = [];
    let loading = true;

    onMount(() => {
        axios.get(process.env.APIURL + "/user/boats?username=" + localStorage.getItem("username") + "&jwt=" + localStorage.getItem("token")).then(res => {
            boats = res.data;
            loading = false;
        }).catch(err => {
            console.log(err)
        })
    })
</script>

<div class="w-full pt-20 pb-10 dark:text-white px-16">
    <h1 class="font-dosis text-4xl font-bold">Boats</h1>
    <p>Control your boats from here.</p>

    {#if loading}
        <p class="mt-4 italic">Loading...</p>
    {/if}

    {#each boats as boat, index}
        <div class="my-3 rounded-lg shadow-xl flex bg-white p-4 w-full">
            <div class="my-auto bg-red-500 rounded-full h-4 w-4 ml-1 mr-3"></div>
            <div>
                <p class="text-sm font-medium text-gray-500"><span class="uppercase">{boat.model}</span> • {boat.id}</p>
                <h1 class="text-xl font-bold">{boat.name}</h1>
            </div>
        </div>
    {/each}
</div>

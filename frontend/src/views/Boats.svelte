<script>
    import {onMount} from "svelte";
    import {Link} from "svelte-routing";
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

    <hr class="opacity-0 my-4">

    {#each boats as boat, index}
        <Link to={"/boats/"+boat.id}>
            <div class="my-3 rounded-lg shadow-none hover:shadow-lg transition duration-200 flex bg-white dark:bg-gray-900 p-4 w-full">
                <div class="my-auto bg-red-600 rounded-full h-4 w-4 ml-2 mr-4"></div>
                <div>
                    <p class="text-sm font-medium text-gray-500">{boat.model} • {boat.id}
                    </p>
                    <h1 class="text-xl font-bold">{boat.name}</h1>
                </div>
            </div>
        </Link>
    {/each}
</div>

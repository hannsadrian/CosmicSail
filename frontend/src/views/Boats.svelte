<script>
    import {onMount} from "svelte";
    import {Link} from "svelte-routing";
    import axios from "axios";
    import InlineError from "../components/InlineError.svelte";
    import Loading from "../components/Loading.svelte";

    let boats = getBoats();

    async function getBoats() {
        return await axios.get(process.env.APIURL + "/user/boats?username=" + localStorage.getItem("username") + "&jwt=" + localStorage.getItem("token"))
    }
</script>

<div class="w-full pt-20 pb-10 dark:text-white px-5 sm:px-16">
    <button class="text-sm font-semibold uppercase text-gray-600 tracking-wider" on:click={() => boats = getBoats()}>
        Reload
    </button>

    <h1 class="font-dosis text-4xl font-bold">Boats</h1>
    <p>Control your boats from here.</p>

    {#await boats}
        <Loading/>
    {:then result}
        <hr class="opacity-0 my-4">
        {#each result.data as boat, index}
            <div class="my-3">
                <Link to={"/boats/"+boat.id}>
                    <div class="rounded-lg shadow-sm hover:shadow-lg transition duration-200 flex bg-white dark:bg-gray-900 p-4 w-full">
                        <div class="my-auto {boat.online ? 'bg-green-600' : 'bg-red-600'} rounded-full h-4 w-4 ml-2 mr-4"></div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">{boat.model} • {boat.id}</p>
                            <h1 class="text-xl font-bold">{boat.name}</h1>
                        </div>
                    </div>
                </Link>
            </div>
        {/each}
    {:catch err}
        {#if err.response}
            <InlineError>{err.response.data.message}</InlineError>
        {:else}
            <InlineError>Server connection failed</InlineError>
        {/if}
    {/await}
</div>

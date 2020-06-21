<script>
    import SegmentedControl from "../../components/SegmentedControl.svelte";
    import axios from "axios";
    import Loading from "../../components/Loading.svelte";
    import InlineError from "../../components/InlineError.svelte";
    import ControlView from "./ControlView.svelte";

    export let id;
    let online = false;

    let boat = getBoats();

    async function getBoats() {
        return await axios.get(process.env.APIURL + "/user/boats/" + id + "?jwt=" + localStorage.getItem("token"))
    }
</script>

<div class="w-full pt-5 sm:pt-20 pb-20 dark:text-white px-5 sm:px-16">
    {#await boat}
        <Loading/>
    {:then res}
        <div class="flex mb-4">
            <div class="my-auto bg-red-600 rounded-full h-4 w-4 mx-4"></div>
            <div>
                <p class="text-sm font-medium text-gray-700">{res.data.model} • {res.data.id}</p>
                <h1 class="text-xl font-bold">{res.data.name}</h1>
            </div>
        </div>
        <SegmentedControl/>
        <ControlView/>
    {:catch err}
        {#if err.response}
            <InlineError>{err.response.data.message}</InlineError>
        {:else}
            <InlineError>Server connection failed</InlineError>
        {/if}
    {/await}
</div>

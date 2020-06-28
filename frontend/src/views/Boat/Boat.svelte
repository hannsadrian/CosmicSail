<script>
    import SegmentedControl from "../../components/SegmentedControl.svelte";
    import axios from "axios";
    import Loading from "../../components/Loading.svelte";
    import InlineError from "../../components/InlineError.svelte";
    import ControlView from "./ControlView.svelte";

    export let id;

    let connected = false;
    const socket = io(process.env.SOCKETURL + "?boatId=" + id + "&token=" + localStorage.getItem("token"));
    socket.on("connect", () => {
        connected = true;
        console.log("connected")
    })
    socket.on("exception", data => {
        console.log(data)
    })
    socket.on("disconnect", () => {
        connected = false;
    })

    let online = false;
    let selected = "Control"

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
            <div class="my-auto {connected ? (online ? 'bg-green-600' : 'bg-red-600') : 'bg-gray-600'} rounded-full h-4 w-4 mx-4"></div>
            <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-400">{res.data.model} • {res.data.id}</p>
                <h1 class="text-xl font-bold">{res.data.name}</h1>
            </div>
        </div>
        <SegmentedControl bind:selected/>
        <div class="{selected !== 'Control' ? 'hidden': ''}">
            <ControlView {socket}/>
        </div>
        <div class="{selected !== 'Autopilot' ? 'hidden': ''}">
            <p>Work in progress (Autopilot)</p>
        </div>
        <div class="{selected !== 'Tracker' ? 'hidden': ''}">
            <p>Tracker in progress</p>
        </div>
    {:catch err}
        {#if err.response}
            <InlineError>{err.response.data.message}</InlineError>
        {:else}
            <InlineError>Server connection failed</InlineError>
        {/if}
    {/await}
</div>

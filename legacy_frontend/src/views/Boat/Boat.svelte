<script>
    import SegmentedControl from "../../components/SegmentedControl.svelte";
    import axios from "axios";
    import Loading from "../../components/Loading.svelte";
    import ControlView from "./ControlView.svelte";
    import {onMount, onDestroy} from "svelte"
    import AutopilotView from "./AutopilotView.svelte";

    export let id;

    let connected = false;
    let socket;

    let online = false;
    let selected = "Control"
    let boat = null

    onMount(() => {
        socket = io(process.env.SOCKETURL + "?boatEmblem=" + id + "&token=" + localStorage.getItem("token"));
        registerEvents(socket)
        getBoats();
    })

    onDestroy(() => {
        console.log("disconnect")
        socket.disconnect()
    })

    function registerEvents(socket) {
        socket.on("connect", () => {
            connected = true;
            console.log("connected")
        })
        socket.on("exception", data => {
            console.log(data)
        })
        socket.on("disconnect", () => {
            connected = false;
            console.log("disconnect")
        })
        socket.on("online", data => {
            console.log(data)
            online = data === "true";
        })
    }

    async function getBoats() {
        let boats = await axios.get(process.env.APIURL + "/v1/boats", {headers: {"Authorization": "Bearer " + localStorage.getItem("token")}})
        let toReturn = []
        boats.data.forEach((b) => {
            if (b.BoatEmblem === id) {
                toReturn = b
            }
        })
        boat = toReturn
        online = boat.Online

        // order rudder to first position
        let rudders = []
        boat.Motors.forEach((m, i) => {
            if (m.Type === "rudder") {
                boat.Motors.splice(i, 1)
                rudders.push(m)
            }
        })

        boat.Motors = [...rudders, ...boat.Motors]
    }
</script>

<div class="w-full pt-5 sm:pt-20 pb-20 dark:text-white px-5 sm:px-16">
    {#if boat != null}
        <div class="flex mb-4">
            <div class="my-auto {connected ? (online ? 'bg-green-600' : 'bg-red-600') : 'bg-gray-600'} rounded-full h-4 w-4 mx-4"></div>
            <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-400">{boat.Series} • {boat.BoatEmblem}</p>
                <h1 class="text-xl font-bold">{boat.Name}</h1>
            </div>
        </div>
        <SegmentedControl bind:selected/>
        <div class="{selected !== 'Control' ? 'hidden': ''}">
            <ControlView {socket} boatConfig={boat}/>
        </div>
        {#if selected === 'Autopilot'}
            <div>
                <AutopilotView {socket} boatConfig="{boat}"/>
            </div>
        {/if}
        <div class="{selected !== 'Tracker' ? 'hidden': ''}">
            <p>Tracker in progress</p>
        </div>
    {:else}
        <Loading/>
    {/if}
</div>

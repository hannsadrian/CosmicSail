<script>
    import Map from "./ControlView/Map.svelte";
    import Rudder from "./ControlView/Rudder.svelte";
    import Sail from "./ControlView/Sail.svelte";
    import Esc from "./ControlView/Esc.svelte";

    export let socket;

    let setup = false;
    let settingUp = false;

    let bandwidth = 0;
    let lat = 0;
    let lng = 0;
    let rotation = 0;
    let sats = 0;
    let mode = 0;
    let speed = 0;
    let precision = [0, 0];
    let error = {}

    socket.on("meta", data => {
        bandwidth = data.network

        if (data.gps !== null) {
            sats = data.gps.sats;
            mode = data.gps.mode;
            error = data.gps.error;
            if (data.gps.position != null) {
                lat = data.gps.position[0]
                lng = data.gps.position[1]
                rotation = data.gps.heading
                speed = data.gps.speed
                precision = data.gps.precision
            } else {
                speed = 0;
                precision = 0;
            }
        } else {
            error = undefined;
        }
    })

    socket.on("exception", data => {
        if (data.name === "setup" && !settingUp) {
            setup = true;
            settingUp = true;
        }
    })

    function setupAGPS() {
        navigator.geolocation.getCurrentPosition(function (location) {
            socket.emit("instruction", {
                name: "setup_agps",
                lat: location.coords.latitude,
                lon: location.coords.longitude
            })
            setup = false;
            error = null;
        })
    }
</script>

<div class="sm:flex mt-4">
    <div style="max-width: 430px" class="w-full">
        <div id="mapbox" class="sm:w-full">
            <Map {lng} {lat} {rotation}/>
        </div>
        {#if setup}
            <button on:click={setupAGPS} class="text-blue-600 w-full text-center mt-2">Setup AGPS</button>
        {:else}
            <p>🌍 M{mode} {"<->"} {sats} Sats {"<->"} {parseFloat(speed * 3.6).toFixed(1)} km/h {"<->"}
                {parseFloat(rotation).toFixed(1)}°<br/>
                {error ? "🚧 ± " + (error.s || 0.00) + " km/h | ± " + ((error.x || 0+error.y || 0)/2).toFixed(1) + " m" : "📍 Locating..."}
                <br/>
                🤖 {parseFloat(bandwidth).toFixed(2)} MB
            </p>
        {/if}
    </div>
    <div class="mt-4">
        <Rudder {socket}/>
        <Sail {socket}/>
        <Esc {socket}/>
    </div>
</div>

<style>
    @media screen and (max-width: 500px) {
        #mapbox {
            height: 30vh !important;
        }
    }

    #mapbox {
        height: 60vh;
    }
</style>

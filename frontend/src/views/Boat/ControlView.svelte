<script>
    import Map from "./ControlView/Map.svelte";
    import GenericMotorControl from "./ControlView/GenericMotorControl.svelte";

    export let socket;
    export let boatConfig;

    let bandwidth = 0

    let gpsData = {
        lat: 0,
        lng: 0,
        rotation: 0,
        sats: 0,
        mode: 0,
        speed: 0,
        precision: [0, 0],
        error: {},
        agpsSetupYet: false
    }

    socket.on("data", data => {
        bandwidth = data.network

        if (data.gps !== null) {
            gpsData.sats = data.gps.sats;
            gpsData.mode = data.gps.mode;
            gpsData.error = data.gps.error;
            if (data.gps.position != null) {
                gpsData.lat = data.gps.position[0]
                gpsData.lng = data.gps.position[1]
                gpsData.rotation = data.gps.heading
                gpsData.speed = data.gps.speed
                gpsData.precision = data.gps.precision
            } else {
                gpsData.speed = 0;
                gpsData.precision = 0;
            }
        } else {
            gpsData.error = undefined;
        }
    })

    socket.on("exception", data => {
        console.log(data)
    })

    function setupAGPS() {
        navigator.geolocation.getCurrentPosition(function (location) {
            socket.emit("instruction", {
                name: "setup_agps",
                lat: location.coords.latitude,
                lon: location.coords.longitude
            })
            gpsData.agpsSetupYet = true;
            gpsData.error = null;
        })
    }
</script>

<div class="sm:flex mt-4">
    <div style="max-width: 430px" class="w-full">
        <div id="mapbox" class="sm:w-full">
            <Map lng={gpsData.lng} lat={gpsData.lat} rotation={gpsData.rotation}/>
        </div>
        {#if !gpsData.agpsSetupYet}
            <button on:click={setupAGPS} class="text-blue-600 w-full text-center mt-2">Setup AGPS</button>
        {/if}
        <p>🌍 M{gpsData.mode} {"<->"} {gpsData.sats} Sats {"<->"} {parseFloat(gpsData.speed * 3.6).toFixed(1)}
            km/h {"<->"}
            {parseFloat(gpsData.rotation).toFixed(1)}°<br/>
            {gpsData.error ? "🚧 ± " + (gpsData.error.s || 0.00) + " km/h | ± " + ((gpsData.error.x || 0 + gpsData.error.y || 0) / 2).toFixed(1) + " m" : "📍 Locating..."}
            <br/>
            🤖 {parseFloat(bandwidth).toFixed(2)} MB
        </p>
    </div>
    <div class="mt-4">
        {#each boatConfig.Motors as motor, i}
            <GenericMotorControl {socket} motorConfig={motor} useOrientation={i === 0}/>
        {/each}
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

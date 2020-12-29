<script>
    import GenericMotorControl from "./ControlView/GenericMotorControl.svelte";
    import GpsSensorDisplay from "./ControlView/GpsSensorDisplay.svelte";
    import InformationModal from "../../components/InformationModal.svelte";
    import ConfiguratorOverview from "./ControlView/hardware/ConfiguratorOverview.svelte";

    export let socket;
    export let boatConfig;

    let motorData = {}
    let sensorData = {}

    socket.on("data", event => {
        let data = null;
        try {
            data = JSON.parse(event)
        } catch (e) {
        }

        if (data == null)
            return;

        if (data.motors != null) {
            data.motors.forEach(motor => {
                motorData[motor.Name] = motor.State
            })
            console.log(motorData)
        }

        if (data.sensors != null) {
            data.sensors.forEach(sensor => {
                sensorData[sensor.Name] = sensor.State
            })
            console.log(sensorData)
        }
    })

    socket.on("exception", data => {
        console.log(data)
    })

    let agpsSetupYet = false

    function setupAGPS() {
        navigator.geolocation.getCurrentPosition(function (location) {
            agpsSetupYet = true

            let gpsSensorName = "";
            boatConfig.Sensors.forEach(s => {
                if (s.Type === "gps")
                    gpsSensorName = s.Name
            })

            socket.emit("setup", JSON.stringify({
                type: "agps",
                name: gpsSensorName,
                lat: location.coords.latitude,
                lon: location.coords.longitude
            }))
        })
    }

    function reloadBoatConfig() {
        socket.emit("setup", JSON.stringify({type: "reload"}))
        location.reload()
    }

    let wantsShutdown = false;
    let isSureToShutdown = false;
    function shutdownBoat() {
        if (!wantsShutdown) {
            wantsShutdown = true;
            return;
        }
        if (!isSureToShutdown) {
            isSureToShutdown = true;
            return;
        }

        console.log("SHUTDOWN")
        socket.emit("setup", JSON.stringify({type: "shutdown"}))
        location.reload()
    }

    let hardwareOpen = false;

    function openHardware() {
        wantsShutdown = false;
        isSureToShutdown = false;
        hardwareOpen = false;
        hardwareOpen = true;
    }
</script>

<InformationModal shown="{hardwareOpen}" title="🛠 Hardware config">
    <div class="mb-4">
        <button on:click={reloadBoatConfig}
                class="px-4 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-400 dark-hover:bg-gray-900 rounded">
            Reload boat
        </button>
        <button on:click={shutdownBoat}
                class="px-4 py-1 bg-red-700 hover:bg-red-800 text-white rounded">
            {#if !wantsShutdown}
                <span>Shutdown boat</span>
            {:else if !isSureToShutdown}
                <span>Sure?</span>
            {:else}
                <span>Really?</span>
            {/if}

        </button>
    </div>
    <ConfiguratorOverview {boatConfig} motors="{boatConfig.Motors}" sensors="{boatConfig.Sensors}"/>
</InformationModal>
<div class="sm:grid grid-cols-2 mt-4">
    <div class="w-full">
        {#each boatConfig.Sensors as sensor, index}
            {#if sensor.Type === "gps"}
                <GpsSensorDisplay gpsData="{sensorData[sensor.Name]}"/>
            {/if}
        {/each}
        <div class="flex space-x-1">
            {#each boatConfig.Sensors as sensor, index}
                {#if sensor.Type === "bandwidth"}
                    <p>🤖 {sensorData[sensor.Name] ? parseFloat(sensorData[sensor.Name]).toFixed(1) : "--"} MB</p>
                {:else if sensor.Type === "ip"}
                    <p>{"<->"} {sensorData[sensor.Name] ? sensorData[sensor.Name] : "---.---.--.---"}</p>
                {/if}
            {/each}
        </div>
    </div>
    <div class="mt-4 sm:mt-0 sm:mx-2 sm:mt-2 mb-auto grid grid-cols-2 items-start">
        {#each boatConfig.Motors as motor, i}
            <GenericMotorControl {socket} metaState={motorData[motor.Name]} motorConfig={motor}
                                 useOrientation={motor.Type === "rudder"}/>
        {/each}
    </div>
    <div class="flex">
        <button on:click={openHardware} class="flex mx-auto text-center mt-5 text-gray-500">
            <ion-icon class="mt-1 mr-1" name="build"></ion-icon>
            <span>Edit hardware</span>
        </button>
        {#if !agpsSetupYet}
            <button on:click={setupAGPS} class="flex mx-auto text-center mt-5 text-gray-500">
                <ion-icon class="mt-1 mr-1" name="compass"></ion-icon>
                <span>Setup AGPS</span>
            </button>
        {/if}
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

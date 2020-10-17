<script>
    import GenericMotorControl from "./ControlView/GenericMotorControl.svelte";
    import GpsSensorDisplay from "./ControlView/GpsSensorDisplay.svelte";

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
            // TODO:
            socket.emit("instruction", {
                name: "setup_agps",
                lat: location.coords.latitude,
                lon: location.coords.longitude
            })


            agpsSetupYet = true
        })
    }
</script>

<div class="sm:grid grid-cols-2 mt-4">
    <div class="w-full">
        {#each boatConfig.Sensors as sensor, index}
            {#if sensor.Type === "gps"}
                <GpsSensorDisplay {agpsSetupYet} gpsData="{sensorData[sensor.Name]}"/>
                {#if agpsSetupYet}
                    <button on:click={setupAGPS} class="text-blue-600 w-full text-center mt-2">Setup AGPS</button>
                {/if}
            {:else if sensor.Type === "bandwidth"}
                <p>🤖 {parseFloat(sensorData[sensor.Name]).toFixed(2)} MB</p>
            {/if}
        {/each}
    </div>
    <div class="mt-4 sm:mt-0 sm:mx-2 sm:mt-2 mb-auto grid grid-cols-2 items-start">
        {#each boatConfig.Motors as motor, i}
            <GenericMotorControl {socket} metaState={motorData[motor.Name]} motorConfig={motor}
                                 useOrientation={i === 0}/>
        {/each}
    </div>
    <button class="flex mx-auto text-center mt-5 text-gray-500">
        <ion-icon class="mt-1 mr-1" name="build"></ion-icon>
        <p>Edit hardware</p>
    </button>
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

<script>
    import Map from "./ControlView/Map.svelte";
    import GenericMotorControl from "./ControlView/GenericMotorControl.svelte";

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

<div class="sm:flex mt-4">
    <div style="max-width: 430px" class="w-full">
        {#each boatConfig.Sensors as sensor, index}
            {#if sensor.Type === "gps"}
                <div id="mapbox" class="sm:w-full">
                    {#if sensorData[sensor.Name] && sensorData[sensor.Name].position != null}
                        <Map lng={sensorData[sensor.Name].position[1]} lat={sensorData[sensor.Name].position[0]}
                             rotation={sensorData[sensor.Name].rotation}/>
                    {:else}
                        <div class="rounded-lg w-full h-full bg-gray-300">
                            <p></p>
                        </div>
                    {/if}
                </div>
                {#if agpsSetupYet}
                    <button on:click={setupAGPS} class="text-blue-600 w-full text-center mt-2">Setup AGPS</button>
                {/if}
                {#if sensorData[sensor.Name]}
                    <p>🌍 M{sensorData[sensor.Name].mode || "-"} {"<->"} {sensorData[sensor.Name].sats || "--"}
                        Sats {"<->"} {parseFloat((sensorData[sensor.Name].speed || 0) * 3.6).toFixed(1)}
                        km/h {"<->"} {parseFloat(sensorData[sensor.Name].heading || 0).toFixed(1)}°<br/>
                        {sensorData[sensor.Name].error != null ? "🚧 ± " + (sensorData[sensor.Name].error.s || 0.00) + " km/h | ± " + ((sensorData[sensor.Name].error.x || 0 + sensorData[sensor.Name].error.y || 0) / 2).toFixed(1) + " m" : "🧭 Locating..."}
                    </p>
                {:else}
                    <p>🌍 M- {"<->"} -- Sats {"<->"} -- km/h {"<->"} --°<br/>🧭 Locating...</p>
                {/if}
            {:else if sensor.Type === "bandwidth"}
                <p>🤖 {parseFloat(sensorData[sensor.Name]).toFixed(2)} MB</p>
            {/if}
        {/each}
    </div>
    <div class="mt-4">
        {#each boatConfig.Motors as motor, i}
            <GenericMotorControl {socket} metaState={motorData[motor.Name]} motorConfig={motor}
                                 useOrientation={i === 0}/>
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

<script>
    import Map from "./ControlView/Map.svelte";
    import Rudder from "./ControlView/Rudder.svelte";

    export let socket;

    let bandwidth = 0;
    let lat = 0;
    let lng = 0;
    let rotation = 0;
    let sats = 0;
    let mode = 0;
    let speed = 0;
    let precision = [0, 0]

    socket.on("meta", data => {
        bandwidth = data.network
        sats = data.gps.sats;
        mode = data.gps.mode;
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
    })
</script>

<div class="sm:flex mt-4">
    <div style="max-width: 430px" class="w-full">
        <div id="mapbox" class="sm:w-full">
            <Map {lng} {lat} {rotation}/>
        </div>
        <p>🌍 M{mode} {"<->"} {sats} Sats {"<->"} {parseFloat(speed * 3.6).toFixed(1)} km/h {"<->"}
            {parseFloat(rotation).toFixed(1)}°<br/>
            🤖 {parseFloat(bandwidth).toFixed(2)} MB
        </p>
    </div>
    <div class="mt-4">
        <Rudder {socket}/>
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

<script>
    import Map from "./ControlView/Map.svelte";
    import Rudder from "./ControlView/Rudder.svelte";

    export let socket;

    let lat = 0;
    let lng = 0;
    let rotation = 0;
    let sats = 0;
    let mode = 0;
    let speed = 0;
    let precision = [0, 0]

    socket.on("meta", data => {
        //console.log(data)
        sats = data.gps.sats;
        mode = data.gps.mode;
        if (data.gps.position != null) {
            lat = data.gps.position[0]
            lng = data.gps.position[1]
            rotation = data.gps.heading
            speed = data.gps.speed
            precision = data.gps.precision
        }
    })
</script>

<div id="mapbox" class="sm:w-2/5 mt-4">
    <Map {lng} {lat} {rotation} />
</div>
<p>M {mode} {"<->"} {sats} Sats {"<->"} {parseFloat(speed).toFixed(2)} m/s | {parseFloat(speed * 3.6).toFixed(2)} km/h</p>

<Rudder {socket}/>

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
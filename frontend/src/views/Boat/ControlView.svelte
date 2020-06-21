<script>
    import Map from "./ControlView/Map.svelte";
    export let socket;

    let lng = 0;
    let lat = 0;
    let rotation = 0;

    socket.on("pos", data => {

    })
</script>

<div style="height: 60vh" class="sm:w-2/5 mt-4 mb-4 sm:mb-0">
    <Map {lng} {lat} {rotation} />
</div>

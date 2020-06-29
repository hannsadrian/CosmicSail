<script>
    import Map from "./ControlView/Map.svelte";
    export let socket;

    let lat = 50.9;
    let lng = 13.6;
    let rotation = 0;

    socket.on("meta", data => {
        console.log(data)
    })

    let rudder = 0;
    $: {
        socket.emit("instruction", {name: "rudder", value: rudder})
    }
</script>

<div style="height: 60vh" class="sm:w-2/5 mt-4 mb-4 sm:mb-0">
    <Map {lng} {lat} {rotation} />
</div>

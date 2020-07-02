<script>
    import {onMount} from "svelte"

    export let socket;


    let rudder = 0;
    let previousRudder = 0;
    let previousOrientation = 0;
    $: {
        // ☢️ ATTENTION ☣️
        //
        // AUTOMATIC VALUE BINDING WHICH EMITS EVERY TIME THE RUDDER VALUE CHANGES
        // TAKE CAUTION (may cause bugs)
        //
        // ☢️ ATTENTION ☣️
        socket.emit("instruction", {name: "rudder", value: rudder})
    }

    onMount(() => {
            window.addEventListener('deviceorientation', function (event) {
                let orientation = Math.floor(event.gamma)
                if (orientation > 30) {
                    orientation = 30;
                } else if (orientation < -30) {
                    orientation = -30;
                }
                orientation = Math.floor(orientation / 3) / 10
                if (orientation === previousOrientation)
                    return

                previousOrientation = orientation;
                rudder = orientation;
            });
    })

</script>

<input type="range" min="-1" max="1" step="0.05" bind:value={rudder}>
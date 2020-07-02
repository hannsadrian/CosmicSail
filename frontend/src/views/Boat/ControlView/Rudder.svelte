<script>
    import {onMount} from "svelte"
    import InformationModal from "../../../components/InformationModal.svelte";

    export let socket;

    let supportsOrientation = false;
    let hasPermissionForOrientation = true;

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
        if ("DeviceOrientationEvent" in window) {
            console.log("Supports Orientation! 🎉")
            supportsOrientation = true;

            requestPermission()

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
        } else {
            console.log("No Orientation on this device 😕")
        }
    })

    function requestPermission() {
        DeviceOrientationEvent.requestPermission().then(value => {
            hasPermissionForOrientation = value === "granted";
        }).catch(err => {
            hasPermissionForOrientation = false;
        })
    }
</script>

<InformationModal shown={!hasPermissionForOrientation} title="Device Orientation">
    <div>
        In order to fully use the boat controls,
        you have to give the webpage permission for the orientation of your device.
    </div>
    <button class='text-blue-600 mt-4' on:click={requestPermission}>Allow</button>
</InformationModal>
<input type="range" min="-1" max="1" step="0.05" bind:value={rudder}>
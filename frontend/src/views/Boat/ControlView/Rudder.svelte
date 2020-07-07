<script>
    import {onMount} from "svelte"
    import InformationModal from "../../../components/InformationModal.svelte";

    export let socket;

    let supportsOrientation = false;
    let hasPermissionForOrientation = true;

    let rudder = 0;
    let previousValue = 0;
    $: {
        // ☢️ ATTENTION ☣️
        //
        // AUTOMATIC VALUE BINDING WHICH EMITS EVERY TIME THE RUDDER VALUE CHANGES
        // TAKE CAUTION (may cause bugs)
        //
        // ☢️ ATTENTION ☣️
        let value = Math.floor((rudder * 30) / 6) / 5
        if (value !== previousValue) {
            previousValue = value;
            socket.emit("instruction", {name: "rudder", value: value})
        }
    }

    let previousRudder = 0;
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
                let value = Math.round(orientation*10) / 300;
                if (value !== previousRudder) {
                    previousRudder = value;
                    rudder = value;
                }
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
<p class="text-sm uppercase text-gray-500 font-semibold tracking-wide -mb-2">Rudder</p>
<input type="range" min="-1" max="1" step="0.0005" class="w-full" bind:value={rudder}>
<script>
    import {onMount} from "svelte";
    import InformationModal from "../../../components/InformationModal.svelte";

    export let socket;
    export let metaState = 0;
    export let motorConfig;
    export let useOrientation = false;

    let value = 0;
    let previousValue = 0;
    $: {
        // ☢️ ATTENTION ☣️
        //
        // AUTOMATIC VALUE BINDING WHICH EMITS EVERY TIME THE VALUE CHANGES
        // TAKE CAUTION (may cause bugs)
        //
        // ☢️ ATTENTION ☣️
        let t = Math.floor((value * 30) / 1.5) / 20
        if (t !== previousValue) {
            previousValue = t;
            socket.emit("command", JSON.stringify({type: "motor", name: motorConfig.Name, value: t}))
        }
    }

    let supportsOrientation = false;
    let hasPermissionForOrientation = true;
    let previousOrientation = 0;
    onMount(() => {
        if (!useOrientation)
            return;

        if ("DeviceOrientationEvent" in window && DeviceOrientationEvent.requestPermission) {
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
                let t = Math.round(orientation * 10) / 300;
                if (t !== previousOrientation) {
                    previousOrientation = t;
                    value = t;
                }
            });
        } else {
            console.log("No Orientation on this device 😕")
        }
    })

    function requestPermission() {
        if (!useOrientation)
            return

        DeviceOrientationEvent.requestPermission().then(value => {
            hasPermissionForOrientation = value === "granted";
        }).catch(err => {
            hasPermissionForOrientation = false;
        })
    }
</script>

<InformationModal shown={!hasPermissionForOrientation && useOrientation} title="Device Orientation">
    <div>
        In order to fully use the boat controls,
        you have to give the webpage permission for the orientation of your device.
    </div>
    <button class='text-blue-600 mt-4' on:click={requestPermission}>Allow</button>
</InformationModal>
<p class="text-sm uppercase text-gray-500 font-semibold tracking-wide mt-2 -mb-2">{motorConfig.Name} ({metaState.toFixed(2)})</p>
<input type="range" min="-1" max="1" step="0.0005" class="w-full" bind:value={value}>

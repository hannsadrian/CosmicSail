<script>
    import {onMount} from "svelte";
    import InformationModal from "../../../components/InformationModal.svelte";
    import HardwareTypeEmoji from "./HardwareTypeEmoji.svelte";

    export let socket;
    export let metaState = null;
    export let motorConfig;
    export let useOrientation = false;

    let value = motorConfig.Default;
    let previousValue = 0;
    $: {
        // ☢️ ATTENTION ☣️
        //
        // AUTOMATIC VALUE BINDING WHICH EMITS EVERY TIME THE VALUE CHANGES
        // TAKE CAUTION (may cause bugs)
        //
        // ☢️ ATTENTION ☣️
        let t = Math.floor((value * 30) / 1.5) / 20
        if (t !== previousValue && t !== metaState) {
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
        you have to give the webpage permission for accessing orientation of your device.
    </div>
    <button class='text-blue-600 mt-4' on:click={requestPermission}>Allow</button>
</InformationModal>
<div class="bg-white dark:bg-gray-900 mx-1 my-1 shadow hover:shadow-lg transition duration-150 px-4 pt-4 pb-2 rounded-lg {useOrientation ? 'col-span-2' : 'col-span-2 md:col-span-1'}">
    <input type="range" min="-1" max="1" step="0.0005" class="w-full shadow-lg" bind:value={value}>
    <p on:click={() => value = motorConfig.Default} class="cursor-pointer text-sm text-gray-800 dark:text-gray-300 text-center">
        <HardwareTypeEmoji hardwareType="{motorConfig.Type}"/> <span class="{useOrientation ? 'font-bold' : ''}">{motorConfig.Name}</span> {metaState != null ? "-> " + metaState.toFixed(1) : ""}
    </p>
</div>

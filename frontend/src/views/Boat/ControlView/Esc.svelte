<script>
    export let socket;
    let esc = 0;
    let previousValue = 0;
    $: {
        // ☢️ ATTENTION ☣️
        //
        // AUTOMATIC VALUE BINDING WHICH EMITS EVERY TIME THE VALUE CHANGES
        // TAKE CAUTION (may cause bugs)
        //
        // ☢️ ATTENTION ☣️
        let value = esc
        if (value !== previousValue) {
            previousValue = value;
            socket.emit("instruction", {name: "esc", value: value})
        }
    }
</script>

<p class="text-sm uppercase text-gray-500 font-semibold tracking-wide mt-2 -mb-2">ESC</p>
<input type="range" min="-1" max="1" step="0.0005" class="w-full" bind:value={esc}>

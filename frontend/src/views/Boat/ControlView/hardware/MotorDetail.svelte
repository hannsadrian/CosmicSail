<script>
    import HardwareTypeEmoji from "../HardwareTypeEmoji.svelte";
    import axios from "axios";

    export let boatConfig;
    export let motor;

    let modifiedMotor = Object.assign({}, motor)

    if (modifiedMotor.Default === 0.00001) {
        modifiedMotor.Default = 0;
    }

    $: {
        if (modifiedMotor.Default > 1)
            modifiedMotor.Default = 1
        if (modifiedMotor.Default < -1)
            modifiedMotor.Default = -1

        if (modifiedMotor.Max > 4000)
            modifiedMotor.Max = 4000
        if (modifiedMotor.Max < 1)
            modifiedMotor.Max = 1

        if (modifiedMotor.Min > 4000)
            modifiedMotor.Min = 4000
        if (modifiedMotor.Min < 1)
            modifiedMotor.Min = 1
    }

    let updated = false;
    let error = false;

    function updateMotor() {
        let defaultSetting = modifiedMotor.Default
        if (defaultSetting === 0)
            defaultSetting = 0.00001

        axios.put(process.env.APIURL + "/v1/boats/" + boatConfig.BoatEmblem + "/motor/" + motor.ID, {
            name: modifiedMotor.Name,
            channel: Math.round(modifiedMotor.Channel),
            default: defaultSetting,
            min: modifiedMotor.Min,
            max: modifiedMotor.Max,
            type: modifiedMotor.Type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(res => {
            error = false;
            updated = true;
            setTimeout(() => updated = false, 3000)
        }).catch(err => {
            error = true;
        })
    }

    let expanded = false;
</script>

<div class="my-1 py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded">
    <div on:click={() => expanded = !expanded} class="cursor-pointer">
        <h4 class="font-semibold">
            <HardwareTypeEmoji hardwareType="{motor.Type}"/> {motor.Name}
        </h4>
    </div>
    {#if expanded}
        <div class="my-1">
            <div class="flex space-x-1">
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Name</p>
                    <input placeholder="Name"
                           required
                           bind:value={modifiedMotor.Name}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Type</p>
                    <input placeholder="Type"
                           required
                           bind:value={modifiedMotor.Type}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
            </div>
            <div class="flex space-x-1">
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Channel</p>
                    <input placeholder="Channel"
                           required
                           type="number"
                           bind:value={modifiedMotor.Channel}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Default (-1; 1)</p>
                    <input placeholder="Default"
                           required
                           type="number"
                           bind:value={modifiedMotor.Default}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
            </div>
            <div class="flex space-x-1">
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Min</p>
                    <input placeholder="Minimum"
                           required
                           type="number"
                           bind:value={modifiedMotor.Min}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Max</p>
                    <input placeholder="Maximum"
                           required
                           type="number"
                           bind:value={modifiedMotor.Max}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
            </div>
            <button on:click={updateMotor} class="px-2 py-1 w-full mt-4 rounded bg-gray-800 text-white">
                {#if error}❌{/if} Update
                {#if updated}✅{/if}
            </button>
        </div>
    {/if}
</div>

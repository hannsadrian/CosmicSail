<script>
    import HardwareTypeEmoji from "../HardwareTypeEmoji.svelte";
    import axios from "axios";

    export let boatConfig;
    export let sensor;

    let modifiedSensor = Object.assign({}, sensor)

    let updated = false;
    let error = false;

    function updateSensor() {

        axios.put(process.env.APIURL + "/v1/boats/" + boatConfig.BoatEmblem + "/sensor/" + sensor.ID, {
            name: modifiedSensor.Name,
            channel: modifiedSensor.Channel,
            type: modifiedSensor.Type
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
            <HardwareTypeEmoji hardwareType="{sensor.Type}"/> {sensor.Name}
        </h4>
    </div>
    {#if expanded}
        <div class="my-1">
            <div class="flex space-x-1">
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Name</p>
                    <input placeholder="Name"
                           required
                           bind:value={modifiedSensor.Name}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
                <div>
                    <p class="uppercase text-xs font-semibold tracking-wider mt-2">Type</p>
                    <input placeholder="Type"
                           required
                           bind:value={modifiedSensor.Type}
                           class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
            </div>
            <p class="uppercase text-xs font-semibold tracking-wider mt-2">Channel</p>
            <input placeholder="Channel"
                   required
                   bind:value={modifiedSensor.Channel}
                   class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
            />

            <button on:click={updateSensor} class="px-2 py-1 w-full mt-4 rounded bg-gray-800 text-white">
                {#if error}❌{/if} Update
                {#if updated}✅{/if}
            </button>
        </div>
    {/if}
</div>

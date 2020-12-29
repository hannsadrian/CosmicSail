<script>
    import HardwareTypeEmoji from "../HardwareTypeEmoji.svelte";
    import axios from "axios";

    export let boatConfig;
    export let sensor;
    export let creationMode = false;

    let modifiedSensor = Object.assign({}, sensor)

    let created = false;
    let creationError = false;
    function addSensor() {

        let defaultSetting = modifiedSensor.Default
        if (defaultSetting === 0)
            defaultSetting = 0.00001

        axios.post(process.env.APIURL + "/v1/boats/" + boatConfig.BoatEmblem + "/sensor", {
            name: modifiedSensor.Name,
            channel: modifiedSensor.Channel,
            type: modifiedSensor.Type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(res => {
            creationError = false;
            created = true;
        }).catch(err => {
            console.log(err.response)
            creationError = true;
        })
    }

    let updated = false;
    let updateError = false;

    function updateSensor() {

        axios.put(process.env.APIURL + "/v1/boats/" + boatConfig.BoatEmblem + "/sensor/" + sensor.ID, {
            name: modifiedSensor.Name,
            channel: modifiedSensor.Channel,
            type: modifiedSensor.Type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(res => {
            updateError = false;
            updated = true;
            setTimeout(() => updated = false, 3000)
        }).catch(err => {
            updateError = true;
        })
    }

    export let open;
    export let setOpen;

    let wantsDeletion = false;
    let deletionError = false;

    function deleteSensor() {
        if (wantsDeletion === false) {
            wantsDeletion = true;
            return;
        }

        axios.delete(process.env.APIURL + "/v1/boats/" + boatConfig.BoatEmblem + "/sensor/" + sensor.ID, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(res => {
            deletionError = false;
            location.reload();
        }).catch(err => {
            deletionError = true;
        })
    }
</script>

<div class="my-1 py-1 px-2 bg-gray-200 dark:bg-gray-700 rounded">
    <div on:click={() => setOpen("sensor"+sensor.ID)} class="cursor-pointer">
        <h4 class="font-semibold">
            {#if !creationMode}
                <HardwareTypeEmoji hardwareType="{sensor.Type}"/> {sensor.Name}
            {:else}
                Add Sensor
            {/if}
        </h4>
    </div>
    {#if open === "sensor"+sensor.ID}
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

            <div class="mt-4 flex">
                {#if !creationMode}
                    <button on:click={updateSensor} class="px-2 w-full py-1 rounded bg-gray-800 text-white">
                        {#if updateError}❌{/if} Update
                        {#if updated}✅{/if}
                    </button>
                    <button on:click={deleteSensor} class="px-2 py-1 ml-1 rounded bg-red-600 text-white">
                        {#if deletionError}
                            Error
                        {:else if wantsDeletion}
                            Sure?
                        {:else}
                            Delete
                        {/if}
                    </button>
                {:else}
                    <button on:click={addSensor} class="px-2 w-full py-1 rounded bg-green-800 text-white">
                        {#if creationError}❌{/if} Add
                        {#if created}✅{/if}
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>

<script>
    import MotorDetail from "./MotorDetail.svelte";
    import SensorDetail from "./SensorDetail.svelte";

    export let boatConfig;
    export let motors;
    export let sensors;
</script>

<p class="uppercase text-xs font-semibold tracking-wider">Motors</p>
{#each motors as motor}
    <MotorDetail {boatConfig} {motor}/>
{/each}

<p class="uppercase text-xs font-semibold tracking-wider mt-2">Sensors</p>
{#each sensors as sensor}
    <SensorDetail {boatConfig} {sensor}/>
{/each}

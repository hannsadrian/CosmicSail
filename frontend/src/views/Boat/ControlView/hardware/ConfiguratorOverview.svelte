<script>
    import MotorDetail from "./MotorDetail.svelte";
    import SensorDetail from "./SensorDetail.svelte";

    export let boatConfig;
    export let motors;
    export let sensors;

    let open = ""

    function setOpen(hardware) {
        if (open === hardware) {
            open = ""
            return;
        }

        open = hardware
    }
</script>

<p class="uppercase text-xs font-semibold tracking-wider">Motors</p>
{#each motors as motor}
    <MotorDetail {boatConfig} {open} {setOpen} {motor}/>
{/each}
<MotorDetail creationMode={true} {boatConfig} {open} {setOpen} motor={{}}/>

<p class="uppercase text-xs font-semibold tracking-wider mt-2">Sensors</p>
{#each sensors as sensor}
    <SensorDetail {boatConfig} {open} {setOpen} {sensor}/>
{/each}
<SensorDetail creationMode={true} {boatConfig} {open} {setOpen} sensor={{}}/>

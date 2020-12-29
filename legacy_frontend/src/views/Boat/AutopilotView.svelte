<script>
    import Map from "./AutopilotView/Map.svelte";
    import Chart from 'svelte-frappe-charts';
    import {onMount} from "svelte";

    export let socket;
    export let boatConfig;

    let data = {
        labels: ['-7s', '-6s', '-5s', '-4s', '-3s', '-2s', '-1s'],
        datasets: [
            {
                values: [0, 0.2, 1, 1.5, 1.8, 2, 1.5]
            }
        ]
    };

    onMount(() => {
    })
</script>

<div class="flex mt-4">
    <div id="mapbox" class="w-1/2" style="height:500px">
        <Map lat={51} lng={13} rotation={0}/>
    </div>
    <div class="w-1/2">
        <Chart {data} tooltipOptions={{}} type="line" valuesOverPoints={true}/>
    </div>
</div>
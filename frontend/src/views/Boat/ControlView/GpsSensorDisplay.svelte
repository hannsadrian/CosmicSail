<script>
    import Map from "./Map.svelte";

    export let gpsData
</script>

<div id="mapbox" class="sm:w-full h-map">
    {#if gpsData && gpsData.position != null}
        <Map lng={gpsData.position[1]} lat={gpsData.position[0]}
             rotation={gpsData.heading}/>
    {:else}
        <div class="rounded-lg w-full h-full bg-gray-400">
            <p></p>
        </div>
    {/if}
</div>

{#if gpsData}
    <p>🌍 M{gpsData.mode || "-"} {"<->"} {gpsData.sats || "--"}
        Sats {"<->"} {parseFloat((gpsData.speed || 0) * 3.6).toFixed(1)}
        km/h {"<->"} {parseFloat(gpsData.heading || 0).toFixed(1)}°<br/>
        {gpsData.error != null ? "🚧 ± " + (gpsData.error.s || 0.00) + " km/h | ± " + ((gpsData.error.x || 0 + gpsData.error.y || 0) / 2).toFixed(1) + " m" : "🧭 Locating..."}
    </p>
{:else}
    <p>🌍 M- {"<->"} -- Sats {"<->"} -- km/h {"<->"} --°<br/>🧭 Locating...</p>
{/if}

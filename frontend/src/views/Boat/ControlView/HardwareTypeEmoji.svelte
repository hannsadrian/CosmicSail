<script>
    import {onMount} from "svelte"

    export let hardwareType;
    let emoji = "";

    onMount(() => {
        switch (hardwareType) {
            case "rudder":
                emoji = "🛶"
                break
            case "sail":
                emoji = "⛵"
                break
            case "engine":
                emoji = "🔌"
                break
            case "gps":
                emoji = "🛰"
                break
            case "bandwidth":
                emoji = "📡"
                break
            case "ip":
                emoji = "👾"
                break
        }
    })
</script>

{emoji}

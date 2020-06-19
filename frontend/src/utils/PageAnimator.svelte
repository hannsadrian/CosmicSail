<script>
    import {fade} from "svelte/transition";
    import {Route, navigate} from "svelte-routing";
    import Authorizer from "./Authorizer.svelte";

    export let path = undefined;
    export let authorized = false;
</script>


<Route {path}>
    <div class="absolute w-full overflow-hidden h-auto" transition:fade="{{ duration: 100 }}">
        <Authorizer {authorized} />
        <slot/>
    </div>
</Route>

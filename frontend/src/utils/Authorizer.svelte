<script>
    import { navigate } from "svelte-routing"
    import { onMount } from 'svelte';
    import axios from "axios";

    export let authorized;

    onMount(async () => {
        if (!authorized)
            return;

        if (localStorage.getItem("username") == null || localStorage.getItem("token") == null) {
            navigate("/login")
            return;
        }

        axios.post(process.env.APIURL + "/auth/status?jwt=" + localStorage.getItem("token")).catch(err => {
            if (err.response)
                console.log(err.response.data)

            navigate("/login")
        })
    });
</script>
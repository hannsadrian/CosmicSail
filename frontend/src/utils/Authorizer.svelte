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

        axios.post(process.env.APIURL + "/v1/status", {}, {headers: {"Authorization": "Bearer " + localStorage.getItem("token")}}).catch(err => {
            console.log(err.response)
            if (err.response)
                console.log(err.response.data)

            navigate("/login")
        }).then(res => {
            if (res.data.payload.Username !== localStorage.getItem("username"))
                navigate("/login")
        })
    });
</script>
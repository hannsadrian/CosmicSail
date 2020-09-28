<script>
    import {navigate} from "svelte-routing";
    import axios from "axios";
    import Button from "../components/Button.svelte";

    let loginError = ""
    let loading = false

    function handleLogin(event) {
        event.preventDefault();
        const formdata = new FormData(event.target);
        loading = true
        axios.post(process.env.APIURL + "/auth/login", {
            username: formdata.get("username"),
            password: formdata.get("password")
        }).then(res => {
            loading = false
            console.log(res)
            localStorage.setItem("username", res.data.Username)
            localStorage.setItem("token", res.data.Token)
            navigate("/boats")
        }).catch(err => {
            loading = false
            console.log(err.response)
            if (err.response)
                loginError = err.response.data
            else
                loginError = "Server connection failed"
        })
    }
</script>

<main class="mt-12 pb-10 mx-10 sm:flex sm:justify-center sm:items-center h-full md:pt-48">
    <div class="sm:mr-10 md:mr-24 my-auto">
        <ion-icon style="font-size: 40px;" class="-mb-2 dark:text-white" name="lock-open"></ion-icon>
        <h1 class="text-5xl font-dosis font-bold dark:text-white">Login</h1>
        <p class="text-gray-700 dark:text-gray-500">
            In order to use <span class="font-semibold">CosmicSail</span>,
            you have to log in.
        </p>
        {#if loginError !== ""}
            <div class="my-2 p-2 mr-auto rounded text-white bg-red-500">
                {loginError}
            </div>
        {/if}
    </div>
    <form on:submit={handleLogin} class="mt-5 sm:my-auto flex-col">
        <p class="mb-2 uppercase text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-300">Credentials</p>
        <div class="mb-2">
            <label>
                <input placeholder="username"
                       type="text"
                       name="username"
                       required
                       class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 p-2 w-full rounded shadow focus:outline-none focus:shadow-md"
                />
            </label>
        </div>
        <div>
            <label>
                <input placeholder="password"
                       type="password"
                       name="password"
                       required
                       class="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 p-2 w-full rounded shadow focus:outline-none focus:shadow-md"
                />
            </label>
        </div>
        <Button isPrimary={true} className="my-3 px-8" text="{loading ? 'Loading' : 'Login'}" type="submit"/>
    </form>
</main>
<script>
    import Tailwindcss from "./Tailwindcss.svelte";
    import {Router, Link, Route, navigate} from "svelte-routing";
    import {fade} from "svelte/transition";
    import PageAnimator from "./utils/PageAnimator.svelte";
    import Button from "./components/Button.svelte";

    import Home from "./views/Home.svelte";
    import Login from "./views/Login.svelte";
    import Error from "./views/Error.svelte";
    import Boats from "./views/Boats.svelte";
    import Boat from "./views/Boat/Boat.svelte";
    import Authorizer from "./utils/Authorizer.svelte";

    export let url = "";
    let open = false;

    if (!!localStorage.getItem("mode-dark"))
        document.documentElement.classList.add("mode-dark");
    const toggleDarkmode = function () {
        if (!!localStorage.getItem("mode-dark")) {
            document.documentElement.classList.remove("mode-dark");
            localStorage.removeItem("mode-dark");
        } else {
            document.documentElement.classList.add("mode-dark");
            localStorage.setItem("mode-dark", true);
        }
    };

</script>

<main class="bg-gray-200 dark:bg-gray-800 transition-bg duration-200 sm:pt-6">
    <Tailwindcss/>
    <Router {url}>
        <div class="sm:mx-10 p-6 bg-white shadow-lg sm:rounded-lg transition-all duration-200 dark:bg-gray-900">
            <div class="flex justify-between">
                <div class="flex">
                    <button on:click={toggleDarkmode}>
                        <div class="my-auto">
                            <img style="height: 2.25rem" alt="" src="/art/Beach.svg"/>
                        </div>
                    </button>
                    <div class="ml-2 my-auto">
                        <Link to="/">
                            <h6 class="-mb-1 uppercase tracking-wider text-xs font-medium text-gray-500">
                                Funzel Environment
                            </h6>
                            <h1 class="font-semibold -mb-1 dark:text-white">
                                Cosmic<span class="text-deepOrange">Sail</span>
                            </h1>
                        </Link>
                    </div>
                </div>
                <div class="my-auto hidden sm:block">
                    <Link to="boats">
                        <Button isPrimary={true} className="mx-1 my-1 px-8 dark-hover:bg-black" text="Boats"/>
                    </Link>
                </div>
                <Button
                        className="block sm:hidden fill-current h-9 dark:bg-gray-800"
                        text="<ion-icon class='text-xl fill-current' name='ellipsis-horizontal' />"
                        onClick={() => open = !open}
                />
            </div>
            <div class={(open ? "opacity-100 mt-5" : "opacity-0") + " transition-all duration-200 flex flex-wrap justify-center whitespace-normal sm:hidden"}
                 style={!open ? "max-height: 0px" : "max-height: 140px"}>
                <Link to="boats">
                    <Button isPrimary={true} className="mx-1 my-1 px-8 dark-hover:bg-black" text="Boats"/>
                </Link>
            </div>

        </div>
        <div class="h-full">
            <PageAnimator path="/">
                <Home/>
            </PageAnimator>
            <PageAnimator path="login">
                <Login/>
            </PageAnimator>
            <PageAnimator authorized={true} path="boats">
                <Boats/>
            </PageAnimator>
            <Route path="boats/:id" let:params>
                <div class="absolute w-full overflow-hidden h-auto" transition:fade="{{ duration: 100 }}">
                    <Authorizer authorized={true} />
                    <Boat id={params.id}/>
                </div>
            </Route>
            <PageAnimator>
                <Error code="404" message="The page you are looking for is not here"/>
            </PageAnimator>
        </div>
    </Router>
</main>

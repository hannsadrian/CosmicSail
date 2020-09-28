<script>
    import {Link} from "svelte-routing";
    import Button from "../components/Button.svelte";
</script>

<main class="mt-12 pb-10 md:mt-20 mx-10 md:flex md:justify-center">
    <div class="md:mr-10 lg:mr-24 pb-10 my-auto">
        <h1 class="text-5xl font-dosis font-bold dark:text-white">Cosmic<span class="text-deepOrange">Sail</span></h1>
        <p class="text-gray-700 dark:text-gray-500">
            Welcome to <span class="font-semibold">CosmicSail</span>,<br/>
            the greatest rc boat<br/>
            control software.
        </p>
        <div class="select-none">
            <Link to="login">
                <Button isPrimary={true} className="px-8 mt-6 dark:bg-gray-900 dark-hover:bg-black" text="Login"/>
            </Link>
        </div>
    </div>
    <img class="w-full h-full max-w-sm" src="/art/Beach.svg" alt=""/>
</main>

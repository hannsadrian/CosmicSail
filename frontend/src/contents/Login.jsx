import React, {useState} from 'react';

const axios = require("axios").default;

const Login = () => {
    let [loginState, setLoginState] = useState("")

    const handleLogin = (event) => {
        event.preventDefault();
        const formdata = new FormData(event.target);
        setLoginState("loading")
        axios.post(process.env.REACT_APP_APIURL + "/auth/login", {
            username: formdata.get("username"),
            password: formdata.get("password")
        }).then(res => {
            setLoginState("")
            localStorage.setItem("username", res.data.Username)
            localStorage.setItem("token", res.data.Token)
            //navigate("/boats")
        }).catch(err => {
            if (err.response)
                setLoginState(err.response.data)
            else
                setLoginState("Server connection failed")
            setTimeout(() => setLoginState(""), 2500)
        })
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="my-auto mx-auto pb-10">
                <div className="flex select-none cursor-default">
                    {loginState !== "" ?
                        <div
                            className={"ml-3 mr-4 my-3 rounded-full h-4 w-4 " + (loginState === "loading" ? "bg-amber-500" : "bg-red-500")}
                        >
                            <div className={"h-4 w-4 animate-ping rounded-full " + (loginState === "loading" ? "bg-amber-400" : "bg-red-400")}/>
                        </div>

                        :
                        <p className="my-auto mr-1 text-4xl">🌊</p>
                    }
                    <div>
                        <h1 className="font-bold text-3xl">Waterway</h1>
                        <p className="uppercase font-semibold text-sm tracking-wider text-gray-500 ml-1 -mt-2">CosmicSail</p>
                    </div>
                </div>

                <form className="mt-2" onSubmit={handleLogin}>
                    <div className="space-y-1">
                        <div>
                            <input name="username" required
                                   className="rounded px-1 shadow-sm hover:shadow w-full focus:outline-none focus:ring ring-indigo-400 transition duration-150"
                                   type="name"/>
                        </div>
                        <div>
                            <input name="password" required
                                   className="rounded px-1 shadow-sm hover:shadow w-full focus:outline-none focus:ring ring-indigo-400 transition duration-150"
                                   type="password"/>
                        </div>
                    </div>
                    <button type="submit"
                            className="rounded px-1 mt-2 bg-amber-500 w-full text-white focus:outline-none hover:ring focus:ring ring-amber-400 transition-all duration-150">Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
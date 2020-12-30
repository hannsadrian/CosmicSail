import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom"

const axios = require("axios").default

function Boats() {
    let [boats, setBoats] = useState([]);

    const logout = () => {
        localStorage.removeItem("username")
        localStorage.removeItem("token")
        window.location.reload()
    }

    useEffect(() => {
        async function fetchBoats() {
            let b = await axios.get(process.env.REACT_APP_APIURL + "/v1/boats", {headers: {"Authorization": "Bearer " + localStorage.getItem("token")}})
            setBoats(b.data)
        }

        fetchBoats()
    }, [])

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-black">
            <div className="m-auto">
                {boats.length > 0 ?
                    <div
                        className="max-w-xs space-x-1 sm:max-w-lg lg:max-w-2xl rounded-xl flex flex-no-wrap overflow-scroll scrollbar-none overflow-y-hidden">
                        {boats.map(b =>
                            <div key={b.BoatEmblem} className="w-64 group shadow-sm hover:shadow-lg bg-white dark:bg-coolGray-900 rounded-xl p-3 m-4 transition duration-200">
                                <Link to={"/boats/" + b.BoatEmblem}>
                                    <img className="rounded-lg" src="https://cosmicsail.online/bg.JPG" alt=""/>
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="mt-2 font-semibold text-lg font-mono dark:text-white">{b.Name} ({b.BoatEmblem})</h3>
                                            <p className="-mt-1 font-mono text-gray-700 dark:text-gray-300">{b.Series} | {b.Make}</p>
                                        </div>
                                        <p className="opacity-0 group-hover:opacity-100 my-auto mr-1 pt-3 text-2xl dark:text-gray-200 transition duration-200">→</p>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                    : <div style={{height: 235}} className="flex w-64 rounded-xl bg-white dark:bg-coolGray-900 m-4">
                        <div className="m-auto">
                            <div
                                className="ml-3 mr-4 my-3 rounded-full h-4 w-4 bg-amber-500"
                            >
                                <div className="h-4 w-4 animate-ping rounded-full bg-amber-500"/>
                            </div>
                        </div>
                    </div>
                }
                <div className="flex my-4">
                    <button onClick={logout}
                            className="mx-auto w-40 py-1 rounded-lg bg-red-600 hover:ring ring-red-400 dark:ring-red-800 text-gray-200 transition duration-200">Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Boats;
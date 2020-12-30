import React, {useEffect, useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import {isAuthorized} from "./utils/auth"
import Login from "./contents/Login";
import Boats from "./contents/Boats";
import BoatDetail from "./contents/BoatDetail";

function App() {
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(false);
    let [redirect, setRedirect] = useState(false);

    useEffect(() => {
        setError(false)
        isAuthorized().catch((err) => {
            if (err === "Network Error")
                setError(err)
            else
                setRedirect(true)
        }).then(() => setLoading(false))
    }, [])

    return (
        <Router>
            {redirect && <Redirect to="/"/>}

            {loading ?
                <div className={"min-w-screen min-h-screen flex bg-gray-100 dark:bg-black"}>
                    <div
                        className={"m-auto rounded-full h-4 w-4 bg-gray-500 dark:bg-gray-700"}
                    >
                        <div className={"h-4 w-4 animate-ping rounded-full bg-gray-400 dark:bg-gray-600"}/>
                    </div>
                </div>
                : error ?
                    <div className={"min-w-screen min-h-screen flex bg-gray-100 dark:bg-black"}>
                        <div className={"m-auto"}>
                            <div
                                className={"mx-auto rounded-full h-4 w-4 bg-red-500"}
                            >
                                <div className={"h-4 w-4 animate-ping rounded-full bg-red-400"}/>
                            </div>
                            <p className="mt-4 dark:text-gray-200">{error}</p>
                        </div>
                    </div>
                    :
                    <Switch>
                        <Route path={"/boats/:emblem"}>
                            <BoatDetail/>
                        </Route>
                        <Route path={"/boats"}>
                            <Boats/>
                        </Route>
                        <Route>
                            <Login/>
                            {!redirect && <Redirect to={"/boats"}/>}
                        </Route>
                    </Switch>

            }
        </Router>
    );
}

export default App;

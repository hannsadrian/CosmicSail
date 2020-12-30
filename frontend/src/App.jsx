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

function App() {
    let [loading, setLoading] = useState(true);
    let [redirect, setRedirect] = useState(false);

    useEffect(() => {
        isAuthorized().catch(() => setRedirect(true)).then(() => setLoading(false))
    }, [])

    return (
        <Router>
            {redirect && <Redirect to="/"/>}

            {!loading ?
                <Switch>
                    <Route path={"/boats"}>
                        <Boats/>
                    </Route>
                    <Route>
                        <Login/>
                        {!redirect && <Redirect to={"/boats"}/>}
                    </Route>

                </Switch>
                :
                <div className={"min-w-screen min-h-screen flex bg-gray-100 dark:bg-black"}>
                <div
                    className={"m-auto rounded-full h-4 w-4 bg-gray-500 dark:bg-gray-700"}
                >
                    <div className={"h-4 w-4 animate-ping rounded-full bg-gray-400 dark:bg-gray-600"}/>
                </div>
                </div>
            }
        </Router>
    );
}

export default App;

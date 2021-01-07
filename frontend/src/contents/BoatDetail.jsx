import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import ReactMapboxGl, {Layer, Feature} from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SensorDeck from "../components/SensorDeck";
import StrengthIndicator from "../components/StrengthIndicator";

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    logoPosition: "bottom-left"
});

function BoatDetail(props) {
    let {emblem} = useParams();

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 md:grid-rows-6 grid-flow-row md:grid-flow-col-dense p-2">
            <div style={{
                backgroundImage: "url('https://cosmicsail.online/bg.JPG')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }} className="row-span-2 col-span-2 h-48 md:h-auto m-1 rounded-lg flex"/>
            <div className="row-span-1 col-span-2 m-1 bg-amber-500 rounded-lg flex">
                <p className="m-auto text-white">Boat overview</p>
            </div>
            <div className="row-span-3 col-span-2 m-1 bg-blue-500 rounded-lg flex">
                <p className="m-auto text-white">Controls</p>
            </div>
            <div style={{height: "400px"}}
                 className="row-span-3 col-span-2 md:col-span-3 m-1 pb-2 rounded-lg flex flex-wrap">
                <div style={{height: "90%"}} className="flex w-full">
                    <Map style={`mapbox://styles/mapbox/outdoors-v10`} center={[13.652844, 50.919446]}
                         containerStyle={{height: "100%", width: "100%"}}/>
                </div>
                <div style={{height: "10%"}} className={"flex-row mt-1 dark:text-gray-300"}>
                    <p>🌍 M{"1"} {"<->"}{"11"} Sats {"<->"}{((2) * 3.6).toFixed(1)} km/h {"<->"}{(73.4).toFixed(1)}°</p>
                    <p>{true ? "🚧 ± " + (0.00) + " km/h | ± " + (0 / 2).toFixed(1) + " m" : "🧭 Locating..."}</p>
                </div>
            </div>
            <div
                className="row-span-2 col-span-2 md:col-span-3 m-1 p-2 rounded-lg flex-wrap lg:flex justify-center align-top select-none bg-gray-900 rounded">
                <SensorDeck heading={0} pitch={0} roll={0} speed={0}/>
                <div className="flex justify-between md:block space-x-2 md:space-x-0 md:space-y-2 text-gray-400 text-center font-mono flex-1 h-auto my-auto md:pl-1 md:pr-2">
                    <div className="bg-gray-800 h-8 rounded shadow-md flex justify-center items-center p-1 w-full">
                        <StrengthIndicator val={0}/>
                    </div>
                    <div className="bg-gray-800 h-8 rounded shadow-md p-1">
                        STP
                    </div>
                    <div className="bg-gray-800 h-8 rounded shadow-md p-1">
                        AGPS
                    </div>
                </div>
            </div>
            <div className="row-span-1 col-span-2 md:col-span-1 m-1 bg-red-500 rounded-lg flex">
                <p className="m-auto text-white">Start</p>
            </div>
            <div className="row-span-1 col-span-2 m-1 bg-gray-500 rounded-lg flex">
                <p className="m-auto text-white">Autopilot controls</p>
            </div>
        </div>
    );
}

export default BoatDetail;
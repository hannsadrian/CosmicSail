import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import ReactMapboxGl, {Layer, Feature} from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SensorDeck from "../components/SensorDeck";

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
            <div className="h-96 row-span-3 col-span-2 m-1 bg-blue-500 rounded-lg flex">
                <p className="m-auto text-white">Controls</p>
            </div>
            <div className="h-96 row-span-3 col-span-2 md:col-span-3 m-1 rounded-lg flex-row">
                <Map style={`mapbox://styles/mapbox/outdoors-v10`} center={[13.652844, 50.919446]}
                     containerStyle={{height: "20.5rem", width: "100%"}}/>
                <div className={"flex-row mt-1 dark:text-gray-300"}>
                    <p>🌍 M{"1"} {"<->"}{"11"} Sats {"<->"}{((2) * 3.6).toFixed(1)} km/h {"<->"}{(73.4).toFixed(1)}°</p>
                    <p>{true ? "🚧 ± " + (0.00) + " km/h | ± " + (0 / 2).toFixed(1) + " m" : "🧭 Locating..."}</p>
                </div>
            </div>
            <div
                className="row-span-2 col-span-2 md:col-span-3 m-1 p-2 rounded-lg flex flex-wrap justify-center select-none bg-gray-900 rounded">
                <SensorDeck heading={0} pitch={0} roll={0} speed={0}/>
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
import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import ReactMapboxGl from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SensorDeck from "../components/SensorDeck";
import StrengthIndicator from "../components/StrengthIndicator";

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    logoPosition: "bottom-left",
    dragPan: true,
    dragRotate: false,
    pitchWithRotate: false,
    bearingSnap: 180
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
            <div className="row-span-1 col-span-2 m-1 py-2 px-4">
                <div className="hidden font-mono dark:text-white text-2xl font-bold sm:flex w-full justify-center">
                    <div className="-ml-6 flex">
                        <div className={"rounded-full bg-green-600 h-4 w-4 mt-2 mr-2"}/> Berlin
                    </div>
                </div>
                <div className="sm:mt-1 flex dark:text-gray-300">
                    <div className="mx-auto sm:mx-0 sm:flex-1 sm:flex sm:space-x-3">
                    <div className="sm:text-right flex-1">
                        <div className="dark:text-white text-2xl font-bold ml-0.5 font-mono flex sm:hidden">
                            <div className={"rounded-full bg-green-600 h-4 w-4 mt-2 mr-1.5"}/> Berlin
                        </div>
                        <p>🌍 <span className="font-mono">M1</span> {"<->"}<span className="font-mono">11</span> Sats {"<->"}<span className="font-mono">3.3km/h</span></p>
                        <p>📡 <span className="font-mono">3.1mb</span> {"<->"} 177.32.655.1</p>
                        <p>🚧 ± <span className="font-mono">1.2km/h</span> {"<->"}± <span className="font-mono">9.3m</span></p>
                    </div>
                    <div className="flex-1">
                        <p><span className="sm:hidden">🏝</span> <span className="font-mono">~20m</span> shore proximity <span className="opacity-0 sm:opacity-100">🏝</span></p>
                        <p><span className="sm:hidden">🤖</span> Autopilot not active <span className="opacity-0 sm:opacity-100">🤖</span></p>
                        <p><span className="sm:hidden">⛵️</span> <span className="font-mono">NNE</span> at <span className="font-mono">4km/h</span> <span className="opacity-0 sm:opacity-100">⛵️</span></p>
                    </div>
                    </div>
                </div>
            </div>
            <div className="row-span-3 col-span-2 m-1 bg-blue-500 rounded-lg flex">
                <p className="m-auto text-white">Controls</p>
            </div>
            <div style={{height: "400px", width: "98.5%", zIndex: 300}}
                 className="row-span-3 col-span-2 md:col-span-3 m-1 mr-2 rounded-lg overflow-hidden h-full w-full">
                <Map onTouchStart={(map, event) => {
                    if (event.originalEvent.touches.length < 2) {
                        map.dragPan.disable()
                    } else {
                        map.dragPan.enable()
                    }
                }} style={`mapbox://styles/mapbox/outdoors-v10`} center={[13.652844, 50.919446]}
                     containerStyle={{height: "100%", width: "100%"}}>
                </Map>
            </div>
            <div
                className="row-span-2 col-span-2 md:col-span-3 m-1 p-2 rounded-lg flex-wrap lg:flex justify-center align-top select-none bg-gray-900 rounded">
                <SensorDeck heading={0} pitch={0} roll={0} speed={0}/>
                <div
                    className="flex justify-between md:block space-x-2 md:space-x-0 md:space-y-2 text-gray-400 text-center font-mono flex-1 h-auto my-auto md:pl-1 md:pr-2">
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
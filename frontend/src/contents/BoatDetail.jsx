import React, {useCallback, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import io from 'socket.io-client';
import ReactMapboxGl, {Feature, GeoJSONLayer, Layer, Marker} from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SensorDeck from "../components/SensorDeck";
import StrengthIndicator from "../components/StrengthIndicator";
import StatusOverview from "../components/boatDetail/StatusOverview";
import MotorController from "../components/boatDetail/MotorController";
import ConfiguratorOverview from "../components/hardwareConfig/ConfiguratorOverview";
import DraggableList from "react-draggable-list";
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const axios = require("axios").default

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    logoPosition: "bottom-left",
    dragPan: true,
    dragRotate: false,
    pitchWithRotate: false,
    bearingSnap: 180
});

const emojiNumbers = {
    1: "1️⃣",
    2: "2️⃣",
    3: "3️⃣",
    4: "4️⃣",
    5: "5️⃣",
    6: "6️⃣",
    7: "7️⃣",
    8: "8️⃣",
    9: "9️⃣",
    10: "🔟",
}

const linePaint = {
    'line-color': 'yellow',
    'line-width': 3
};


const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length
    && Object.keys(o1).every(p => o1[p] === o2[p]);

const arraysEqual = (a1, a2) =>
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));


function BoatDetail(props) {
    let {emblem} = useParams();
    let [socket, setSocket] = useState(null);

    let [mapZoom, setMapZoom] = useState(16);

    let [displayTrail, setDisplayTrail] = useState(false);
    let [geoJSONLine, setGeoJSONLine] = useState({
        'type': 'FeatureCollection',
        features: [
            {
                'type': 'Feature',
                geometry: {
                    'type': 'LineString',
                    coordinates: []
                }
            }
        ]
    });

    let [connected, setConnected] = useState(false);
    let [online, setOnline] = useState(false);

    // error blocks the entire screen with either the option to reload the page or go to boat overview
    let [error, setError] = useState("");

    let [showConfig, setShowConfig] = useState(false);

    let [boat, setBoat] = useState({});
    let [boatSensors, setBoatSensors] = useState({});
    let [motorData, setMotorData] = useState(null);
    let [sensorData, setSensorData] = useState(null);

    let [addMode, setAddMode] = useState(false);
    let [editMode, setEditMode] = useState(false);
    let [wayPoints, setWayPoints] = useState([]);


    useEffect(() => {
        /**
         *
         BoatEmblem: "asdef"
         LastOnline: "2021-01-09T16:53:51.035643+01:00"
         Make: "Robbe"
         Motors:
         0
         Channel: 1
         Cycle: 24
         Default: 1
         Max: 3000
         Min: 1250
         Name: "Ruder"
         Type: "rudder"
         --
         1
         Channel: 2
         Cycle: 24
         Default: 1
         Max: 2200
         Min: 3500
         Name: "Segel"
         Type: "sail"
         --
         2
         Channel: 3
         Cycle: 24
         Default: 0.00001
         Max: 3000
         Min: 2000
         Name: "Diesel"
         Type: "engine"
         Name: "Berlin"
         Online: false
         Sensors:
         0
         Channel: "/dev/ttyAMA0"
         Name: "Position"
         Type: "gps"
         --
         1
         Channel: "internet"
         Name: "Data"
         Type: "bandwidth"
         --
         2
         Channel: "internet"
         Name: "IP"
         Type: "ip"
         --
         3
         Channel: "0"
         Name: "BNO"
         Type: "bno"

         Series: "Topas"
         *
         */
        async function fetchBoats() {
            let boats = await axios.get(process.env.REACT_APP_APIURL + "/v1/boats", {headers: {"Authorization": "Bearer " + localStorage.getItem("token")}})

            let b = boats.data.find(t => t.BoatEmblem === emblem)
            if (!b) {
                setError(emblem + " not found")
                return
            }

            // create sensor map by types
            let s = {}
            b.Sensors.forEach(n => {
                s[n.Type] = n
            })
            setBoatSensors(s)

            // order rudder to first position
            let r = []
            b.Motors.forEach((m, i) => {
                if (m.Type === "rudder") {
                    b.Motors.splice(i, 1)
                    r.push(m)
                }
            })

            b.Motors = [...r, ...b.Motors]
            console.log(b)
            setBoat(b)
        }

        fetchBoats()
    }, [emblem])

    useEffect(() => {
        if (socket != null) socket.disconnect()

        let s = io(process.env.REACT_APP_SOCKET + "/?boatEmblem=" + emblem + "&token=" + localStorage.getItem("token"), {transports: ["websocket"]});

        s.on("connect", () => {
            s.emit("command", JSON.stringify({type: "full_meta"}))
            setConnected(true)
            console.log("connected")
        })
        s.on("connect_error", (data) => {
            console.log(data)
        })
        s.on("exception", data => {
            console.log(data)
        })
        s.on("disconnect", () => {
            setConnected(false)
            console.log("disconnect")
        })
        s.on("online", data => {
            setOnline(data === "true");
        })

        s.on("data", event => {
            let data = null;
            try {
                data = JSON.parse(event)
            } catch (e) {
            }
            if (data == null)
                return;
            if (data.motors != null) {
                let md = {}
                data.motors.forEach(motor => {
                    md[motor.Name] = motor.State
                })
                setMotorData(m => {
                    return {...m, ...md}
                })
            }
            if (data.sensors != null) {
                let sd = {}
                data.sensors.forEach(sensor => {
                    sd[sensor.Name] = sensor.State
                })
                setSensorData(s => {
                    return {...s, ...sd}
                })
            }
        })

        setSocket(s)
    }, [emblem])

    // reassign indexes in waypoint list
    const reassignWayPoints = (newWayPoints, switchToEdit) => {
        setEditMode(switchToEdit)
        setWayPoints(newWayPoints)

        setTimeout(() => {
            for (let i = 0; i < newWayPoints.length; i++) {
                newWayPoints[i].index = i + 1
            }
            setWayPoints(newWayPoints)
        }, 500)
    }

    const addWayPoint = (map, event, index) => {
        setWayPoints(wps => {
            wps.push({id: Math.random() * Math.random(), index: index, lat: event.lngLat.lat, lng: event.lngLat.lng});
            return wps
        })
        setAddMode(false)
        setEditMode(true)
    }

    const [lastTransmittedWayPoints, setLastTransmittedWayPoints] = useState([])
    useEffect(() => {
        console.log(sensorData)

        if (sensorData && sensorData.autopilot && !editMode && !addMode && !arraysEqual(lastTransmittedWayPoints, sensorData.autopilot?.way_points)) {
            let wps = []
            sensorData.autopilot?.way_points?.forEach(wp => {
                wps.push({id: Math.random() * Math.random(), index: wps.length + 1, lat: wp.lat, lng: wp.lng})
            })
            reassignWayPoints(wps, false)
            setLastTransmittedWayPoints(sensorData.autopilot?.way_points)
        }

        if (displayTrail && !!sensorData && !!sensorData[boatSensors['gps'].Name]?.position) {
            let point = [sensorData[boatSensors['gps'].Name].position[1], sensorData[boatSensors['gps'].Name].position[0]];

            if (!geoJSONLine.features[0].geometry.coordinates.find(coords => coords[0] === point[0] && coords[1] === point[1])) {
                setGeoJSONLine(line => {
                    line.features[0].geometry.coordinates.push(point);
                    return line
                })
            }
        }
        if (!displayTrail && geoJSONLine.features[0].geometry.coordinates.length > 0)
            geoJSONLine.features[0].geometry.coordinates = []

    }, [addMode, boatSensors, editMode, lastTransmittedWayPoints, sensorData, displayTrail])


    const setupAGPS = useCallback(() => {
        navigator.geolocation.getCurrentPosition(function (location) {
            console.log({
                type: "agps",
                name: boatSensors['gps'].Name,
                lat: location.coords.latitude,
                lon: location.coords.longitude
            })
            socket.emit("setup", JSON.stringify({
                type: "agps",
                name: boatSensors['gps'].Name,
                lat: location.coords.latitude,
                lon: location.coords.longitude
            }))
        })
    }, [socket, boatSensors])

    if (error) {
        return (
            <div className="w-screen h-screen flex justify-center align-center">
                <div className="my-auto text-center">
                    <div className={"my-3 mx-auto rounded-full h-4 w-4 bg-red-600"}>
                        <div className={"h-4 w-4 animate-ping rounded-full bg-red-500"}/>
                    </div>
                    <p className="mx-auto my-4 font-mono dark:text-white">{error}</p>
                    <button onClick={() => window.location.reload()}
                            className="mx-auto w-40 py-1 rounded-lg bg-gray-600 hover:ring ring-gray-400 dark:ring-gray-800 text-gray-200 transition duration-200">
                        Reload page
                    </button>
                    <Link to={"/boats"}><p className="text-gray-400 dark:text-gray-600">Go to boats</p></Link>
                </div>
            </div>
        )
    }

    // TODO: improve data fetching

    let lat = boatSensors['gps'] && sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].position ?
        sensorData[boatSensors['gps'].Name].position[0] : 50.919446;
    let lng = boatSensors['gps'] && sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].position ?
        sensorData[boatSensors['gps'].Name].position[1] : 13.652844;

    let heading = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].heading) || 0;
    let pitch = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && -sensorData[boatSensors['bno'].Name].pitch) || 0;
    let roll = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].roll) || 0;
    let speed = (boatSensors['gps'] && sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].speed * 3.6) || 0;

    let sys_cal = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status && sensorData[boatSensors['bno'].Name].cal_status[0]) || 0;
    let gyro_cal = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status && sensorData[boatSensors['bno'].Name].cal_status[1]) || 0;
    let acc_cal = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status && sensorData[boatSensors['bno'].Name].cal_status[2]) || 0;
    let mag_cal = (boatSensors['bno'] && sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status && sensorData[boatSensors['bno'].Name].cal_status[3]) || 0;

    if (showConfig) {
        return (<div className="w-full min-h-screen flex justify-center">
            <div className="m-auto p-4 w-full max-w-sm rounded-lg shadow-xl bg-white dark:bg-gray-900">
                <div className="mb-2 font-bold text-lg flex justify-between dark:text-white">
                    <h3>🛠 Hardware</h3>
                    <button className="font-mono" onClick={() => setShowConfig(false)}>(x)</button>
                </div>
                <ConfiguratorOverview boatEmblem={boat.BoatEmblem} socket={socket} motors={boat.Motors}
                                      sensors={boat.Sensors}/>
            </div>
        </div>)
    }

    return (
        <div>
            <div
                className="mb-10 md:mb-0 grid grid-cols-2 md:grid-cols-5 md:grid-rows-6 grid-flow-row md:grid-flow-col-dense p-2 dark:bg-gray-900">
                <div style={{
                    backgroundImage: "url('" + boat.Image + "')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }} className="row-span-2 col-span-2 h-48 md:h-auto m-1 rounded-lg flex"/>
                <div className="row-span-1 col-span-2 bg-gray-200 dark:bg-black rounded-lg m-1 py-2 px-4">
                    <StatusOverview name={boat.Name || "Loading..."} connected={connected} online={online}
                                    boatSensors={boatSensors} sensorData={sensorData}/>
                </div>
                <div className="row-span-3 col-span-2 m-1 rounded-lg">
                    <div className="w-full gap-2 grid grid-cols-2 grid-rows-2 md:h-control-sliders">
                        {boat.Motors && boat.Motors.map((m, i) => <MotorController key={m.Name} motorConfig={m}
                                                                                   socket={socket}
                                                                                   state={motorData && motorData[m.Name]}
                                                                                   useOrientation={i === 0}
                                                                                   autopilotActive={sensorData?.autopilot?.active}/>)}
                    </div>
                    <div
                        className="bg-gray-200 dark:bg-black dark:text-white mt-2 rounded-lg md:flex md:h-waypoint-control">
                        <div className="md:w-1/2 flex">
                            {wayPoints.length === 0 &&
                            <p className="mx-auto my-2 md:m-auto font-mono text-gray-400 dark:text-gray-600">No
                                waypoints
                                set.</p>}
                            <div className="my-auto max-h-48">
                                <DraggableList itemKey={(item) => {
                                    if (item) return item.id
                                }} template={WayPointListEntry}
                                               list={wayPoints}
                                               onMoveEnd={newList => reassignWayPoints(newList, true)}
                                               container={() => document.body}/>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex">
                            <div className="my-auto w-full">
                                <div className="my-2 flex w-full">
                                    <div className="ml-7 md:mx-auto pr-3 font-mono">
                                        {/*<div>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 uppercase">
                                            📟 Mission Progress
                                        </p>
                                        <p className="text-sm ml-6 -mt-1">{sensorData?.autopilot?.mission_progress}</p>
                                    </div>*/}
                                        <div>
                                            <p style={{fontFamily: "monospace, Segoe UI Emoji"}}
                                               className="text-xs text-gray-700 dark:text-gray-300 uppercase">
                                                🎚 Next Waypoint Distance
                                            </p>
                                            <p className="text-sm ml-6 -mt-1">{sensorData?.autopilot?.next_waypoint_dist || '---'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2 font-mono text-sm flex space-x-2 w-full px-2 md:px-4 2xl:px-6">
                                    <button onClick={() => {
                                        setAddMode(a => !a);
                                        if (!addMode) setEditMode(false)
                                    }}
                                            style={{fontFamily: "monospace, Segoe UI Emoji"}}
                                            disabled={wayPoints.length >= 4}
                                            className={"px-2 py-1 bg-gray-300 dark:bg-gray-800 dark:text-gray-300 ring-orange-500 ring-0 hover:ring-2 transition duration-200 flex-none rounded " + (addMode && " ring-4 hover:ring-4 ") + (wayPoints.length >= 4 && " ring-0 hover:ring-0 cursor-not-allowed text-gray-500 dark:text-gray-600 ")}
                                    >
                                        🗺 Add
                                    </button>
                                    <button onClick={() => {
                                        setEditMode(e => !e);
                                        if (!editMode) setAddMode(false)
                                    }}
                                            className={"px-2 py-1 bg-gray-300 dark:bg-gray-800 dark:text-gray-300 ring-orange-500 ring-0 hover:ring-2 transition duration-200 flex-grow rounded w-full " + (editMode && "ring-4 hover:ring-4")}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        disabled={wayPoints.length === 0}
                                        onClick={() => {
                                            setEditMode(true);
                                            setAddMode(false);
                                            wayPoints.splice(0, 1);
                                            reassignWayPoints(wayPoints, true);
                                        }}
                                        className={"px-2 py-1 bg-gray-300 dark:bg-gray-800 dark:text-gray-300 ring-orange-500 ring-0 hover:ring-2 transition duration-200 flex-none rounded " + (wayPoints.length === 0 && " ring-0 hover:ring-0 cursor-not-allowed text-gray-500 dark:text-gray-600 ")}>
                                        🪂 Skip
                                    </button>
                                </div>
                                <div className="mb-2 font-mono text-sm flex space-x-2 w-full px-2 md:px-4 2xl:px-6">
                                    <button onClick={() => {
                                        socket.emit("setup", JSON.stringify({
                                            type: 'autopilot_waypoints',
                                            waypoints: wayPoints
                                        }))
                                        setAddMode(false)
                                        setEditMode(false)
                                    }}
                                            className="px-2 py-1 bg-gray-300 dark:bg-gray-800 dark:text-gray-300 ring-orange-500 ring-0 hover:ring-2 transition duration-200 flex-grow rounded w-full"
                                    >
                                        📡 Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{height: "25.125rem", width: "98.5%", zIndex: 300}}
                     className="row-span-3 col-span-2 md:col-span-3 m-1 mr-2 rounded-lg overflow-hidden h-full w-full">
                    <Map onTouchStart={(map, event) => {
                        if (event.originalEvent.touches.length < 2) {
                            map.dragPan.disable()
                        } else {
                            map.dragPan.enable()
                        }
                    }}
                         style={`mapbox://styles/mapbox/outdoors-v10`}
                         center={!editMode && !addMode && [lng, lat]}
                         zoom={!editMode && !addMode && [mapZoom]}
                         movingMethod={"easeTo"}
                         onZoomEnd={(map, event) => {
                             setMapZoom(map.getZoom())
                         }}
                         onMouseDown={addMode && ((map, event) => {
                             setAddMode(false);
                             addWayPoint(map, event, wayPoints.length + 1)
                         })}
                         containerStyle={{height: "100%", width: "100%", touchAction: (editMode || addMode) && "none"}}>
                        <Marker
                            coordinates={[lng, lat]}
                            anchor="center"
                            className="h-6 w-6"
                        >
                            <img
                                style={{"transform": "rotate(" + heading + "deg)"}}
                                alt="" src={process.env.REACT_APP_APIURL + "/arrow_up.png"}/>
                        </Marker>

                        <GeoJSONLayer
                            data={Object.assign({}, geoJSONLine)}
                            linePaint={linePaint}
                        />

                        {wayPoints.map(wp =>
                            <Layer
                                key={wp.id}
                                type="symbol"
                                layout={{
                                    "icon-image": "harbor-15",
                                    "icon-allow-overlap": true,
                                    "text-field": emojiNumbers[wp.index] || '--',
                                    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                                    "text-size": 11,
                                    "text-transform": "uppercase",
                                    "text-letter-spacing": 0.05,
                                    "text-offset": [0, 1.5]
                                }}>
                                <Feature
                                    draggable={!!editMode}
                                    coordinates={[wp.lng, wp.lat]}
                                    onDragEnd={event => {
                                        if (event.lngLat) setWayPoints(wps => {
                                            wps[wp.index - 1].lat = event.lngLat.lat;
                                            wps[wp.index - 1].lng = event.lngLat.lng;
                                            return wps;
                                        })
                                    }}
                                />
                            </Layer>
                        )}
                    </Map>
                </div>
                <div
                    className="row-span-2 col-span-2 md:col-span-3 m-1 p-2 rounded-lg flex-wrap lg:flex justify-center align-top select-none bg-gray-200 dark:bg-black rounded">
                    {boatSensors && boatSensors['bno'] &&
                    <SensorDeck
                        heading={heading}
                        pitch={pitch}
                        roll={roll}
                        speed={speed}
                        startup={true}
                    />
                    }
                    <div
                        className="relative flex justify-between md:block space-x-2 md:space-x-0 md:space-y-2 text-gray-900 dark:text-gray-400 text-center font-mono flex-1 h-auto my-auto md:pl-1 md:pr-2">
                        {boatSensors && boatSensors['bno'] &&
                        <div
                            className="bg-gray-300 dark:bg-gray-900 h-8 rounded flex justify-center items-center p-1 w-full">
                            <StrengthIndicator
                                sys={sys_cal}
                                gyro={gyro_cal}
                                acc={acc_cal}
                                mag={mag_cal}/>
                        </div>
                        }
                        <button onClick={() => setDisplayTrail(t => !t)}
                                className={"bg-gray-300 dark:bg-gray-900 ring-orange-500 ring-0 hover:ring-2 transition duration-200 h-8 md:w-full rounded p-1 " + (displayTrail && "ring-4 hover:ring-4")}>
                            TRAIL
                        </button>
                        <button onClick={() => setShowConfig(true)}
                                className="bg-gray-300 dark:bg-gray-900 ring-orange-500 ring-0 hover:ring-2 transition duration-200 h-8 md:w-full rounded p-1">
                            STP
                        </button>
                        <button onClick={setupAGPS}
                                className="bg-gray-300 dark:bg-gray-900 ring-orange-500 ring-0 hover:ring-2 transition duration-200 h-8 md:w-full rounded p-1">
                            AGPS
                        </button>
                    </div>
                </div>
                <div
                    className="row-span-1 col-span-2 md:col-span-1 h-32 md:h-auto m-1 bg-gray-200 dark:bg-black rounded-lg flex">
                    <div className="flex-wrap m-auto">
                        <div className="flex space-x-1">
                            <button
                                hidden={sensorData?.autopilot?.active}
                                className="my-auto cursor-default rounded bg-gray-200 dark:bg-black text-xs font-semibold font-mono text-gray-700 dark:text-gray-400 p-2">
                                PILOT
                            </button>
                            <button
                                hidden={!sensorData?.autopilot?.active}
                                onClick={() => socket.emit("setup", JSON.stringify({type: 'tack'}))}
                                className="my-auto cursor-default rounded bg-gray-200 dark:bg-black text-xs font-semibold font-mono text-gray-700 dark:text-gray-400 p-2">
                                TACK
                            </button>
                            <button
                                onClick={() => socket.emit("setup", JSON.stringify({type: sensorData.autopilot?.active ? 'autopilot_stop' : 'autopilot_start'}))}
                                className={(sensorData?.autopilot?.active ? "bg-red-500" : "bg-green-600") + " py-3 px-5 font-bold font-mono text-xl rounded-lg text-white"}>
                                {sensorData?.autopilot?.active ? "STOP" : "START"}
                            </button>
                            <button
                                hidden={sensorData?.autopilot?.active}
                                onClick={() => socket.emit("setup", JSON.stringify({type: 'autopilot_reset'}))}
                                className="my-auto rounded bg-gray-200 hover:bg-gray-300 dark:bg-black dark:hover:bg-gray-700 text-xs font-semibold font-mono text-gray-700 dark:text-gray-400 p-2">
                                RESET
                            </button>
                            <button
                                hidden={!sensorData?.autopilot?.active}
                                onClick={() => socket.emit("setup", JSON.stringify({type: 'gybe'}))}
                                className="my-auto cursor-default rounded bg-gray-200 dark:bg-black text-xs font-semibold font-mono text-gray-700 dark:text-gray-400 p-2">
                                GYBE
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    className="row-span-1 col-span-2 m-1 bg-gray-200 dark:bg-black rounded-lg px-4 py-3 font-mono text-black dark:text-white flex-wrap md:flex">
                    <div className="md:w-5/12 flex">
                        <div className="md:m-auto space-y-2">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 uppercase">⛵️ Mode</p>
                                <p onClick={() => socket.emit("setup", JSON.stringify({
                                    type: "autopilot_mode",
                                }))} className="ml-7 -mt-1 cursor-pointer">{sensorData?.autopilot?.mode || '---'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 uppercase">🚥 State</p>
                                <p onClick={() => sensorData?.autopilot?.mode?.includes('MOTOR') && socket.emit("setup", JSON.stringify({
                                    type: "autopilot_state",
                                    state: sensorData?.autopilot?.state?.includes("STAY") ? 'linear_motor' : 'stay_motor'
                                }))} className="ml-7 -mt-1 cursor-pointer">{sensorData?.autopilot?.state || '---'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-7/12 flex">
                        <div className="my-2 md:my-auto md:ml-8 space-y-2">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 uppercase">🔭 Approach Rate</p>
                                <p className="ml-7 -mt-1">{sensorData?.autopilot?.approach_rate || '---'}</p>
                            </div>
                            {/*<div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 uppercase">📜 Last instruction</p>
                            <p className="ml-7 -mt-1">{sensorData?.autopilot?.last_instruction}</p>
                        </div>*/}
                        </div>
                    </div>
                </div>
            </div>
            {sensorData?.simulated &&
            <SimulationController boatSensors={boatSensors} sensorData={sensorData} socket={socket}/>
            }
        </div>
    );
}

function SimulationController({socket, sensorData, boatSensors}) {
    let [lat, setLat] = useState(null)
    let [lng, setLng] = useState(null)

    const uploadLatLng = useCallback(() => {
        if (lat == null || lng == null)
            return

        console.log(lat)
        console.log(lng)
        socket.emit('setup', JSON.stringify({
            'type': 'sim_origin',
            'lat': lat,
            'lng': lng
        }))
    }, [lat, lng, socket])

    return (
        <div className="mx-4 mb-20 md:mb-4 dark:text-gray-400">
            <button
                onClick={() =>
                    socket.emit('setup', JSON.stringify({'type': 'toggle_sim'}))
                }>{sensorData?.simulation ? 'stop simulation' : 'start simulation'}
            </button>

            <span className="ml-4">Wind</span>
            <input onInput={event => socket.emit('setup', JSON.stringify({
                'type': 'sim_wind_dir',
                'wind_dir': parseFloat(event.target.value) % 360
            }))} className="w-32 ring-0 ring-blue-500 hover:ring-2 focus:outline-none rounded mx-1 dark:bg-black dark:placeholder-gray-600"
                   placeholder={sensorData && (parseFloat(sensorData[boatSensors['wind']?.Name]?.direction).toFixed(1) + '° (max. 359)')}/>
            <input onInput={event => {
                socket.emit('setup', JSON.stringify({
                    'type': 'sim_wind_speed',
                    'wind_speed': parseFloat(event.target.value) % 40
                }))
            }} className="w-32 ring-0 ring-blue-500 hover:ring-2 focus:outline-none rounded mx-1 dark:bg-black dark:placeholder-gray-600"
                   placeholder={sensorData && (parseFloat(sensorData[boatSensors['wind']?.Name]?.speed).toFixed(1) + 'm/s (max. 40)')}/>

            <span className="ml-4">Pos</span>
            <input onInput={event => {setLat(event.target.value.split(', ')[0]); setLng(event.target.value.split(', ')[1])}} className="w-48 ring-0 ring-blue-500 hover:ring-2 focus:outline-none rounded mx-1 dark:bg-black dark:placeholder-gray-600"
                   placeholder={'Lat, Lng'}/>
            <button onClick={uploadLatLng}>Upload</button>
        </div>
    )
}

class WayPointListEntry extends React.Component {
    render() {
        let {item, dragHandleProps} = this.props

        return (
            <div style={{touchAction: "none"}}
                 className="select-none ml-3 m-2 flex h-8 w-64 font-mono" {...dragHandleProps}>
                <div className="m-1 rounded-full text-gray-900 dark:text-gray-100 bg-gray-300 dark:bg-gray-700">
                    <p className="mx-2">{item.index}</p>
                </div>
                <div className="ml-2 px-2 bg-gray-300 dark:bg-gray-800 rounded flex">
                    <p className="my-auto mr-3">{emojiNumbers[item.index]}</p>
                    <span className="my-auto text-sm text-gray-900 dark:text-gray-300">
                    {parseFloat(item.lat).toFixed(5)}, {parseFloat(item.lng).toFixed(5)}
                </span>
                </div>
            </div>
        )
    }
}

export default BoatDetail;

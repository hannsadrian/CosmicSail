import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import io from 'socket.io-client';
import ReactMapboxGl from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SensorDeck from "../components/SensorDeck";
import StrengthIndicator from "../components/StrengthIndicator";
import StatusOverview from "./boatDetail/StatusOverview";
import MotorController from "./boatDetail/MotorController";

const axios = require("axios").default

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
    let [socket, setSocket] = useState(null);

    let [connected, setConnected] = useState(false);
    let [online, setOnline] = useState(false);

    // error blocks the entire screen with either the option to reload the page or go to boat overview
    let [error, setError] = useState("");
    let [boat, setBoat] = useState({});
    let [boatSensors, setBoatSensors] = useState({});
    let [motorData, setMotorData] = useState(null);
    let [sensorData, setSensorData] = useState(null);


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

    useEffect(() => {
        console.log(motorData)
    }, [motorData])

    useEffect(() => {
        console.log(sensorData)
    }, [sensorData])

    if (error) {
        return (
            <div className="w-screen h-screen flex justify-center align-center">
                <div className="my-auto text-center">
                    <div
                        className={"my-3 mx-auto rounded-full h-4 w-4 bg-red-600"}
                    >
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

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 md:grid-rows-6 grid-flow-row md:grid-flow-col-dense p-2">
            <div style={{
                backgroundImage: "url('https://cosmicsail.online/bg.JPG')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }} className="row-span-2 col-span-2 h-48 md:h-auto m-1 rounded-lg flex"/>
            <div className="row-span-1 col-span-2 m-1 py-2 px-4">
                <StatusOverview name={boat.Name || "Loading..."} connected={connected} online={online}
                                boatSensors={boatSensors} sensorData={sensorData}/>
            </div>
            <div className="row-span-2 col-span-2 m-1 rounded-lg md:flex">
                <div className="w-full grid grid-cols-2 grid-rows-2 my-auto">
                    {boat.Motors && boat.Motors.map((m, i) => <MotorController motorConfig={m} socket={socket}
                                                                               state={motorData && motorData[m.Name]}
                                                                               useOrientation={i === 0}/>)}
                </div>
            </div>
            <div className="row-span-1 col-span-2 m-1 bg-gray-500 rounded-lg flex">
                <p className="m-auto text-white">Autopilot controls</p>
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
                {boatSensors && boatSensors['bno'] &&
                <SensorDeck
                    heading={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].heading) || 0}
                    pitch={(sensorData && sensorData[boatSensors['bno'].Name] && -sensorData[boatSensors['bno'].Name].pitch) || 0}
                    roll={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].roll) || 0}
                    speed={0}
                    startup={true}
                />
                }
                <div
                    className="flex justify-between md:block space-x-2 md:space-x-0 md:space-y-2 text-gray-400 text-center font-mono flex-1 h-auto my-auto md:pl-1 md:pr-2">
                    {boatSensors && boatSensors['bno'] &&
                    <div className="bg-gray-800 h-8 rounded shadow-md flex justify-center items-center p-1 w-full">
                        <StrengthIndicator
                            sys={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status[0]) || 0}
                            gyro={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status[1]) || 0}
                            acc={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status[2]) || 0}
                            mag={(sensorData && sensorData[boatSensors['bno'].Name] && sensorData[boatSensors['bno'].Name].cal_status[3]) || 0}/>
                    </div>
                    }
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
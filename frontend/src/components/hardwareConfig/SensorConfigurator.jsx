import React, {useState} from 'react';
import HardwareEmoji from "../boatDetail/HardwareEmoji";

const axios = require("axios").default;

const SensorConfigurator = ({itemOpen, onOpenChange, boatEmblem, creationMode, sensorConfig}) => {
    // null = ignore; false = error; true = success;
    let [created, setCreated] = useState(null);
    let [updated, setUpdated] = useState(null);
    let [deleted, setDeleted] = useState(null);

    let [name, setName] = useState((!creationMode && sensorConfig.Name) || "");
    let [channel, setChannel] = useState((!creationMode && sensorConfig.Channel) || "");
    let [type, setType] = useState((!creationMode && sensorConfig.Type) || "");

    const addSensor = () => {
        setCreated(null)
        axios.post(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/sensor", {
            name: name,
            channel: channel,
            type: type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(() => {
            setCreated(true)
        }).catch(() => {
            setCreated(false)
        })
    }

    const updateSensor = () => {
        axios.put(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/sensor/" + sensorConfig.ID, {
            name: name,
            channel: channel,
            type: type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(() => {
            setUpdated(true)
            setTimeout(() => setUpdated(null), 3000)
        }).catch(() => {
            setUpdated(false)
        })
    }

    const deleteSensor = () => {
        if (deleted == null) {
            setDeleted('confirm')
            return;
        }
        axios.delete(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/sensor/" + sensorConfig.ID, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(() => {
            setDeleted(true)
            window.location.reload();
        }).catch(() => {
            setDeleted(false)
        })
    }

    return (
        <div className="my-1 py-1 px-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div onClick={() => onOpenChange("sensor" + (sensorConfig.ID || "create"))} className="cursor-pointer">
                <h4 className="font-medium">
                    {!creationMode ?
                        <>
                            <HardwareEmoji hardware={sensorConfig.Type}/> {sensorConfig.Name}
                        </>
                        :
                        <>
                            Add Sensor
                        </>
                    }
                </h4>
            </div>
            {itemOpen === "sensor" + (sensorConfig.ID || "create") &&
            <div className="my-1">
                <div className="flex space-x-1">
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2">Name</p>
                        <input placeholder="Name"
                               required
                               onChange={e => setName(e.target.value)}
                               value={name}
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2"><HardwareEmoji
                            hardware={type}/> Type</p>
                        <input placeholder="Type"
                               required
                               onChange={e => setType(e.target.value)}
                               value={type}
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                </div>
                <div>
                    <p className="uppercase text-xs font-semibold tracking-wider mt-2">Channel</p>
                    <input placeholder="Channel"
                           required
                           onChange={e => setChannel(e.target.value)}
                           value={channel}
                           className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                    />
                </div>
                <div className="mt-4 flex">
                    {!creationMode ?
                        <>
                            <button onClick={updateSensor} className="px-2 w-full py-1 rounded bg-gray-900 text-white">
                                {updated === false && "❌"} Update {updated === true && "✅"}
                            </button>
                            <button onClick={deleteSensor} className="px-2 py-1 ml-1 rounded bg-red-600 text-white">
                                {deleted === false && "Error"}
                                {deleted === 'confirm' && "Sure?"}
                                {deleted == null && "Delete"}
                            </button>
                        </>
                        :
                        <button onClick={addSensor} className="px-2 w-full py-1 rounded bg-green-900 text-white">
                            {created === false && "❌"} Add {created === true && "✅"}
                        </button>
                    }
                </div>
            </div>
            }
        </div>
    );
};

export default SensorConfigurator;

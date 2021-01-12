import React, {useState} from 'react';
import HardwareEmoji from "../boatDetail/HardwareEmoji";

const axios = require("axios").default;

const MotorConfigurator = ({itemOpen, onOpenChange, boatEmblem, creationMode, motorConfig}) => {
    // null = ignore; false = error; true = success;
    let [created, setCreated] = useState(null);
    let [updated, setUpdated] = useState(null);
    let [deleted, setDeleted] = useState(null);

    let [name, setName] = useState((!creationMode && motorConfig.Name) || "");
    let [channel, setChannel] = useState((!creationMode && motorConfig.Channel) || 1);
    let [defaultSetting, setDefaultSetting] = useState((!creationMode && motorConfig.Default) || 0.0001);
    let [min, setMin] = useState((!creationMode && motorConfig.Min) || 2000);
    let [max, setMax] = useState((!creationMode && motorConfig.Max) || 3000);
    let [type, setType] = useState((!creationMode && motorConfig.Type) || "");

    const addMotor = () => {
        setCreated(null)
        axios.post(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/motor", {
            name: name,
            channel: channel,
            default: defaultSetting,
            min: min,
            max: max,
            type: type
        }, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(() => {
            setCreated(true)
        }).catch(() => {
            setCreated(false)
        })
    }

    const updateMotor = () => {
        axios.put(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/motor/" + motorConfig.ID, {
            name: name,
            channel: channel,
            default: defaultSetting,
            min: min,
            max: max,
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

    const deleteMotor = () => {
        if (deleted == null) {
            setDeleted('confirm')
            return;
        }
        axios.delete(process.env.REACT_APP_APIURL + "/v1/boats/" + boatEmblem + "/motor/" + motorConfig.ID, {
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
        }).then(() => {
            setDeleted(true)
            window.location.reload();
        }).catch(() => {
            setDeleted(false)
        })
    }

    return (
        <div className="my-1 py-1 px-2 bg-gray-200 dark:bg-gray-800 rounded">
            <div onClick={() => onOpenChange("motor" + (motorConfig.ID || "create"))} className="cursor-pointer">
                <h4 className="font-semibold">
                    {!creationMode ?
                        <>
                            <HardwareEmoji hardware={motorConfig.Type}/> {motorConfig.Name}
                        </>
                        :
                        <>
                            Add Motor
                        </>
                    }
                </h4>
            </div>
            {itemOpen === "motor" + (motorConfig.ID || "create") &&
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
                <div className="flex space-x-1">
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2">Channel</p>
                        <input placeholder="Channel"
                               required
                               type="number"
                               onChange={e => setChannel(Math.round(parseFloat(e.target.value)))}
                               value={channel}
                               min="1"
                               max="24"
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2">Default (-1; 1)</p>
                        <input placeholder="Default"
                               required
                               type="number"
                               onChange={e => setDefaultSetting(parseFloat(e.target.value) === 0 ? parseFloat(e.target.value) + 0.0001 : parseFloat(e.target.value))}
                               value={parseFloat(defaultSetting + '').toFixed(2)}
                               min="-1"
                               max="1"
                               step={0.01}
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                </div>
                <div className="flex space-x-1">
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2">Min</p>
                        <input placeholder="Minimum"
                               required
                               type="number"
                               onChange={e => setMin(parseFloat(e.target.value))}
                               value={min}
                               min="1"
                               max="4000"
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                    <div>
                        <p className="uppercase text-xs font-semibold tracking-wider mt-2">Max</p>
                        <input placeholder="Maximum"
                               required
                               type="number"
                               onChange={e => setMax(parseFloat(e.target.value))}
                               value={max}
                               min="1"
                               max="4000"
                               className="placeholder-gray-500 transition duration-200 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 w-full rounded shadow focus:outline-none focus:shadow-md"
                        />
                    </div>
                </div>
                <div className="mt-4 flex">
                    {!creationMode ?
                        <>
                            <button onClick={updateMotor} className="px-2 w-full py-1 rounded bg-gray-900 text-white">
                                {updated === false && "❌"} Update {updated === true && "✅"}
                            </button>
                            <button onClick={deleteMotor} className="px-2 py-1 ml-1 rounded bg-red-600 text-white">
                                {deleted === false && "Error"}
                                {deleted === 'confirm' && "Sure?"}
                                {deleted == null && "Delete"}
                            </button>
                        </>
                        :
                        <button onClick={addMotor} className="px-2 w-full py-1 rounded bg-green-900 text-white">
                            {created === false && "❌"} Add {created === true && "✅"}
                        </button>
                    }
                </div>
            </div>
            }
        </div>
    );
};

export default MotorConfigurator;
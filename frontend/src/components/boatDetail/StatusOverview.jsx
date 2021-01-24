import React from 'react';
import HardwareEmoji from "./HardwareEmoji";

const StatusOverview = ({name, connected, online, sensorData, boatSensors}) => {
    return (
        <>
            <div className="hidden font-mono dark:text-white text-2xl font-bold sm:flex w-full justify-center">
                <div className="-ml-6 flex">
                    <div
                        className={"rounded-full h-4 w-4 mt-2 mr-2 " + (connected && online ? "bg-green-600" : connected && !online ? "bg-red-600" : "bg-gray-500")}/>
                    {name}
                </div>
            </div>
            <div className="sm:mt-1 flex dark:text-gray-300">
                <div className="mx-auto sm:mx-0 sm:flex-1 sm:flex sm:space-x-3">
                    <div className="sm:text-right flex-1 select-none cursor-default">
                        <div className="dark:text-white text-2xl font-bold ml-0.5 font-mono flex sm:hidden">
                            <div
                                className={"rounded-full h-4 w-4 mt-2 mr-1.5 " + (connected && online ? "bg-green-600" : connected && !online ? "bg-red-600" : "bg-gray-500")}/>
                            {name}
                        </div>
                        {boatSensors['gps'] &&
                        <p><HardwareEmoji hardware="gps"/> <span
                            className="font-mono">M{(sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].mode) || "-"}</span> {"<->"}<span
                            className="font-mono">{(sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].sats) || "--"}</span> Sats {"<->"}<span
                            className="font-mono">{(sensorData && parseFloat('' + ((sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].speed) || 0) * 3.6).toFixed(1)) || "--"}km/h</span>
                        </p>
                        }
                        {boatSensors['bandwidth'] && boatSensors['ip'] &&
                        <p><HardwareEmoji hardware="bandwidth"/> <span
                            className="font-mono">{(sensorData && sensorData[boatSensors['bandwidth'].Name]) || "--"}mb</span> {"<->"}{(sensorData && sensorData[boatSensors['ip'].Name]) || "---.--.---.-"}
                        </p>
                        }
                        {boatSensors['gps'] &&
                        <p>
                            {sensorData && sensorData[boatSensors['gps'].Name] && sensorData[boatSensors['gps'].Name].error ?
                                <><HardwareEmoji hardware="gps_error"/> ± <span className="font-mono">
                                    {parseFloat('' + (sensorData[boatSensors['gps'].Name].error.s || 0.00) * 3.6).toFixed(1)}km/h</span>
                                    {" <->"}± <span className="font-mono">
                                    {((sensorData[boatSensors['gps'].Name].error.x || 0 + sensorData[boatSensors['gps'].Name].error.y || 0) / 2).toFixed(1)}m</span>
                                </> : <><HardwareEmoji hardware="locating"/> Locating, no gps...</>}</p>
                        }
                    </div>
                    <div className="flex-1 select-none cursor-default">
                        {boatSensors['shore'] &&
                        <>
                            <p><span className="sm:hidden"><HardwareEmoji hardware="nearest-shore"/></span> <span
                                className="font-mono">{(sensorData && sensorData[boatSensors['shore']?.Name]?.shortest?.dist && "~" + sensorData[boatSensors['shore']?.Name]?.shortest?.dist + "m") || "No"}</span> shore
                                proximity <span className="opacity-0 sm:opacity-100"><HardwareEmoji
                                    hardware="nearest-shore"/></span></p>
                            <p><span className="sm:hidden"><HardwareEmoji hardware="shore"/></span> <span
                                className="font-mono">{(sensorData && sensorData[boatSensors['shore']?.Name]?.straight?.dist && "~" + sensorData[boatSensors['shore']?.Name]?.straight?.dist + "m") || "No"}</span> shore
                                ahead <span className="opacity-0 sm:opacity-100"><HardwareEmoji
                                    hardware="shore"/></span></p>

                        </>
                        }
                        {boatSensors['bno'] &&
                        <p>
                            <span className="sm:hidden"><HardwareEmoji hardware="wind"/></span> <span
                            className="font-mono">NNE</span> at <span
                            className="font-mono">4km/h</span> <span className="opacity-0 sm:opacity-100"><HardwareEmoji
                            hardware="wind"/></span>
                        </p>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatusOverview;

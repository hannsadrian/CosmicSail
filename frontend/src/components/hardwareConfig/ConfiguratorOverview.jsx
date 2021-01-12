import React, {useState} from 'react';
import MotorConfigurator from "./MotorConfigurator";
import SensorConfigurator from "./SensorConfigurator";

const ConfiguratorOverview = ({socket, boatEmblem, motors, sensors}) => {
    let [openItem, setOpenItem] = useState("")
    let [shutdownStage, setShutdownStage] = useState(0);

    const reloadBoat = () => {
        socket.emit("setup", JSON.stringify({type: "reload"}))
        window.location.reload()
    }

    const shutdownBoat = () => {
        if (shutdownStage === 0) {
            setShutdownStage(1)
            return;
        }
        if (shutdownStage === 1) {
            setShutdownStage(2)
            return;
        }
        console.log("SHUTDOWN")
        socket.emit("setup", JSON.stringify({type: "shutdown"}))
        window.location.reload()
    }

    return (
        <div className="dark:text-gray-300">
            <div className="mb-4">
                <button onClick={reloadBoat}
                        className="mr-2 px-4 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-500 rounded">
                    Reload boat
                </button>
                <button onClick={shutdownBoat}
                        className="px-4 py-1 bg-red-700 hover:bg-red-800 text-white rounded">
                    {shutdownStage === 0 ?
                        <span>Shutdown boat</span>
                        : shutdownStage === 1 ?
                            <span>Sure?</span>
                            :
                            <span>Really?</span>
                    }
                </button>
            </div>

            <p className="uppercase text-xs font-semibold tracking-wider">Motors</p>
            {motors.map((m, k) =>
                <MotorConfigurator key={k} itemOpen={openItem} onOpenChange={i => setOpenItem(i)}
                                   boatEmblem={boatEmblem} creationMode={false} motorConfig={m}/>
            )}
            <MotorConfigurator itemOpen={openItem} onOpenChange={i => setOpenItem(i)} boatEmblem={boatEmblem}
                               creationMode={true} motorConfig={{}}/>

            <p className="mt-2 uppercase text-xs font-semibold tracking-wider">Sensors</p>
            {sensors.map((s, k) =>
                <SensorConfigurator key={k} itemOpen={openItem} onOpenChange={i => setOpenItem(i)}
                                   boatEmblem={boatEmblem} creationMode={false} sensorConfig={s}/>
            )}
            <SensorConfigurator itemOpen={openItem} onOpenChange={i => setOpenItem(i)} boatEmblem={boatEmblem}
                               creationMode={true} sensorConfig={{}}/>
        </div>
    )
}


export default ConfiguratorOverview;
import React, {useCallback, useEffect, useState} from 'react';
import HardwareEmoji from "./HardwareEmoji";

const MotorController = ({socket, motorConfig, useOrientation, state}) => {
    let [hasRotationPermission, setHasRotationPermission] = useState(false)
    let [locked, setLocked] = useState(false)

    let [s, setS] = useState(0)
    let [previousValue, setPreviousValue] = useState(state)

    const setMotor = useCallback((v) => {
        setS(v)
        if (socket == null) return

        let t = Math.floor((v * 30) / 1.5) / 20
        if (t !== previousValue && t !== state) {
            setPreviousValue(t)
            socket.emit("command", JSON.stringify({type: "motor", name: motorConfig.Name, value: t}))
        }
    }, [motorConfig.Name, previousValue, socket, state])

    useEffect(() => {
        if (locked) return

        //setMotor(state || 0)
    }, [state, locked])

    const requestPermission = () => {
        console.log("request ")
        if (!useOrientation)
            return

        let prevVal = 0
        window.DeviceOrientationEvent.requestPermission().then(value => {
            console.log(value)
            setHasRotationPermission(value === "granted");
            window.addEventListener('deviceorientation', function (event) {
                let orientation = Math.floor(event.gamma)
                if (orientation > 30) {
                    orientation = 30;
                } else if (orientation < -30) {
                    orientation = -30;
                }
                let t = Math.round(orientation * 10) / 300;
                if (t !== prevVal) {
                    prevVal = t
                    setS(t)
                    setMotor(t)
                }
            });
        }).catch(err => {
            setHasRotationPermission(false);
        })
    }

    useEffect(() => {
        setS(motorConfig.Default)

        if (!useOrientation)
            return;
        if ("DeviceOrientationEvent" in window && window.DeviceOrientationEvent.requestPermission) {
            console.log("Supports Orientation! 🎉")
        } else {
            console.log("No Orientation on this device 😕")
            setHasRotationPermission(true)
        }
    }, [])

    return (
        <div key={motorConfig.Name}
            className={"select-none bg-gray-200 dark:bg-black transition duration-150 px-4 pt-4 pb-2 rounded-lg " + (useOrientation ? 'col-span-2' : 'col-span-2 md:col-span-1')}>
            <input type="range" min="-1" max="1" step="0.1" className="w-full"
                   onMouseDown={() => setLocked(true)} onMouseUp={() => setLocked(false)}
                   onDragStart={() => setLocked(true)} onDragEnd={() => setLocked(false)}
                   onChange={(event) => setMotor(event.target.value)} value={s}/>
            {useOrientation && !hasRotationPermission && <button className="dark:text-gray-400" onClick={requestPermission}>Request orientation</button>}
            <p onClick={() => setMotor(motorConfig.Default)}
               className="cursor-pointer text-sm text-gray-800 dark:text-gray-300 text-center">
                <HardwareEmoji hardware={motorConfig.Type}/>{" "}
                <span className={useOrientation ? 'font-bold' : undefined}>{motorConfig.Name}</span> {(state || state === 0) && "-> " + parseFloat(state).toFixed(1)}
            </p>
        </div>
    );
};

export default MotorController;

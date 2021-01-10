import React, {useEffect, useState} from 'react';
import HardwareEmoji from "./HardwareEmoji";

const MotorController = ({socket, motorConfig, useOrientation, state}) => {
    let [locked, setLocked] = useState(false)

    let [s, setS] = useState(0)
    let [previousValue, setPreviousValue] = useState(state)

    const setMotor = (v) => {
        setS(v)
        if (socket == null) return

        let t = Math.floor((v * 30) / 1.5) / 20
        if (t !== previousValue && t !== state) {
            setPreviousValue(t)
            socket.emit("command", JSON.stringify({type: "motor", name: motorConfig.Name, value: t}))
        }
    }

    useEffect(() => console.log(locked), [locked])

    useEffect(() => {
        if (locked) return

        setS(state || 0)
    }, [state, locked])

    return (
        <div
            className={"bg-white dark:bg-gray-900 mx-1 my-1 shadow hover:shadow-lg transition duration-150 px-4 pt-4 pb-2 rounded-lg " + (useOrientation ? 'col-span-2' : 'col-span-2 md:col-span-1')}>
            <input type="range" min="-1" max="1" step="0.0005" className="w-full shadow-lg"
                   onMouseDown={() => setLocked(true)} onMouseUp={() => setLocked(false)}
                   onDragStart={() => setLocked(true)} onDragEnd={() => setLocked(false)}
                   onChange={(event) => setMotor(event.target.value)} value={s}/>
            <p onClick={() => setMotor(motorConfig.Default)}
               className="cursor-pointer text-sm text-gray-800 dark:text-gray-300 text-center">
                <HardwareEmoji hardware={motorConfig.Type}/>{" "}
                <span
                    className="{useOrientation ? 'font-bold' : ''}">{motorConfig.Name}</span> {(state || state === 0) && "-> " + parseFloat(state).toFixed(1)}
            </p>
        </div>
    );
};

export default MotorController;
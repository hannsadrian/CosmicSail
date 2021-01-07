import React, {useEffect, useState} from 'react';

const gray = "bg-gray-500"
const colors = ["bg-red-500", "bg-amber-500", "bg-green-500"]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const StrengthIndicator = ({val}) => {
    let [locked, setLocked] = useState(true)
    let [strength, setStrength] = useState(0);
    let [dots, setDots] = useState([])

    useEffect(() => {
        async function executeFancyStartup() {
            for (let i = 0; i <= 10; i++) {
                setStrength(i / 10)
                await sleep(60)
            }
            await sleep(600)
            for (let i = 10; i >= 0; i--) {
                setStrength(i / 10)
                await sleep(45)
            }
            setLocked(false)
        }
        executeFancyStartup()
    }, [])

    useEffect(() => {
        if (locked)
            return

        let v = 1

        if (val <= 1 && val >= -1)
            v = Math.abs(val)

        setStrength(v)
    }, [val, locked])

    useEffect(() => {
        let d = []
        for (let i = 0; i < 9; i++) {
            let useColor = strength * 9 >= i+1
            if (useColor) {
                d.push(<div key={i} className={"h-2 w-2 rounded-full " + colors[Math.floor(i / 3)]}/>)
            } else {
                d.push(<div key={i} className={"h-2 w-2 rounded-full " + gray}/>)
            }
        }
        setDots(d)
    }, [strength])

    return (
        <div className="flex space-x-1">
            {dots}
        </div>
    );
};

export default StrengthIndicator;
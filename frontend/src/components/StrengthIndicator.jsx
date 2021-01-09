import React, {useEffect, useState} from 'react';

const colors = ["bg-gray-500", "bg-red-500", "bg-amber-500", "bg-green-500"]


const StrengthIndicator = ({sys, gyro, acc, mag}) => {
    let [sysStrength, setSysStrength] = useState(0);
    let [gyroStrength, setGyroStrength] = useState(0);
    let [accStrength, setAccStrength] = useState(0);
    let [magStrength, setMagStrength] = useState(0);
    let [dots, setDots] = useState([])

    useEffect(() => {
        setSysStrength(Math.abs(sys))
        setGyroStrength(Math.abs(gyro))
        setAccStrength(Math.abs(acc))
        setMagStrength(Math.abs(mag))
    }, [sys, gyro, acc, mag])

    useEffect(() => {
        let d = []
        for (let i = 1; i < 9; i++) {
            let color = 0

            if (i <= 2) {
                color = Math.round(sysStrength)
            } else if (i <= 4) {
                color = Math.round(gyroStrength)
            } else if (i <= 6) {
                color = Math.round(accStrength)
            } else if (i <= 8) {
                color = Math.round(magStrength)
            }

            d.push(<div key={i} className={"h-2 w-2 rounded-full " + colors[color]}/>)
        }
        setDots(d)
    }, [sysStrength, gyroStrength, accStrength, magStrength])

    return (
        <div className="flex space-x-1">
            {dots}
        </div>
    );
};

export default StrengthIndicator;
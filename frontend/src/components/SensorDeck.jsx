import React, {useEffect, useState} from 'react';
import {Airspeed, AttitudeIndicator, HeadingIndicator} from "../flight-indicators";

const SensorDeck = (props) => {
    let [animateHeading, setAnimateHeading] = useState(true);
    let [prevHeading, setPrevHeading] = useState(0);
    let [heading, setHeading] = useState(0); /* 0 to 360 */
    let [pitch, setPitch] = useState(0); /* -20 to 20 */
    let [roll, setRoll] = useState(0); /* -90 to 90 */
    let [speed, setSpeed] = useState(0); /* 0 to 16 */

    let [locked, setLocked] = useState(true);

    useEffect(() => {
        setTimeout(() => cal(), 500)
    }, [])

    useEffect(() => {
        if (locked) return

        setHeading(normalizeAngle(props.heading))

        setPitch(props.pitch || 0)
        setRoll(props.roll || 0)
        setSpeed(props.speed || 0)
    }, [props.heading, props.pitch, props.roll, props.speed])


    useEffect(() => {
        if (heading < 0) {
            setAnimateHeading(false)
            setHeading(360 + heading)
            setPrevHeading(360 + heading)
        } else {
            setTimeout(() => {setAnimateHeading(true)}, 500)
        }
    }, [heading])


    const normalizeAngle = (direction) => {
        let newAngle = direction,
            rot = Math.abs(prevHeading),
            ar = Math.abs(rot % 360);

        //while (newAngle < 0) { newAngle += 360; }
        //while (newAngle > 360) { newAngle -= 360; }
        //while (rot < 0) { rot += 360; }
        //while (rot > 360) { rot -= 360; }

        //if (ar < 0) { ar += 360; }
        if (ar < 180 && Math.abs(newAngle) > ar + 180) { rot -= 360; }
        if (ar >= 180 && Math.abs(newAngle) <= ar - 180) { rot += 360; }

        rot += newAngle - ar;
        setPrevHeading(Math.abs(rot/360)*360);

        return rot;
    }

    const cal = () => {
        setLocked(true);
        setHeading(360)
        setPitch(10)
        setRoll(90)
        setSpeed(16)
        setTimeout(() => {
            setHeading(0)
            setPitch(-10)
            setRoll(-90)
            setSpeed(0)
            setTimeout(() => {
                setPitch(0)
                setRoll(0)
                locked = setLocked(false);
            }, 1400)
        }, 1600)
    }

    return (
        <div className="flex -space-x-5 md:-space-x-7 -mx-2 -my-9 sm:my-0">
            <HeadingIndicator heading={Math.round(heading)} showBox={false} animate={animateHeading}/>
            <AttitudeIndicator roll={roll} pitch={pitch} showBox={false}/>
            <Airspeed speed={speed * 10}
                      showBox={false}/> {/* airspeed is made for up to 160 units so instead of giving 16, give 160 */}
        </div>
    );
};

export default SensorDeck;
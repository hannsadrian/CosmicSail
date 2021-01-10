import React from 'react';

const HardwareEmoji = ({hardware}) => {
    switch (hardware) {
        case "gps":
            return <>🌍</>
        case "gps_error":
            return <>🚧</>
        case "bandwidth":
            return <>📡</>
        case "locating":
            return <>🧭</>
        case "wind":
            return <>🍃</>
        case "autopilot":
            return <>🤖</>
        case "shore":
            return <>🏝</>
        case "rudder":
            return <>🛶</>
        case "sail":
            return <>⛵</>
        case "engine":
            return <>⛽️</>
        default:
            return <></>
    }
};

export default HardwareEmoji;
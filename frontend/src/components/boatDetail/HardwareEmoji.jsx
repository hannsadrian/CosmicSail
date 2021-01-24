import React from 'react';

const hardwares = [
    {name: "gps", emoji: "🌍"},
    {name: "gps_error", emoji: "🚧"},
    {name: "bandwidth", emoji: "📟"},
    {name: "ip", emoji: "🏷"},
    {name: "bno", emoji: "🧭"},
    {name: "locating", emoji: "🔎"},
    {name: "wind", emoji: "🍃"},
    {name: "autopilot", emoji: "🤖"},
    {name: "shore", emoji: "🏝"},
    {name: "nearest-shore", emoji: "🏖"},
    {name: "rudder", emoji: "🛶"},
    {name: "sail", emoji: "⛵"},
    {name: "engine", emoji: "⛽️"},
]

const HardwareEmoji = ({hardware}) => {
    let emoji = hardwares.find(h => h.name === hardware)

    return <>{emoji && emoji.emoji}</>
};

export default HardwareEmoji;

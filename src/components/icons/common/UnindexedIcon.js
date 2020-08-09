import React from "react"

const UnindexedIcon = ({ color = "#4A5568" }) => {
    return (
        <svg width="18px" height="18px" viewBox="0 0 18 18">
            <path d="M8.5,5.25 L8.5,6.75 L4.5,6.75 C3.30913601,6.75 2.33435508,7.67516159 2.25519081,8.84595119 L2.25,9 C2.25,10.190864 3.17516159,11.1656449
            4.34595119,11.2448092 L4.5,11.25 L8.5,11.25 L8.5,12.75 L4.5,12.75 C2.49574083,12.75 0.858726255,11.1776389 0.755198009,9.19915857
            L0.75,9 C0.75,6.99574083 2.32236105,5.35872626 4.30084143,5.25519801 L4.5,5.25 L8.5,5.25 Z" fill={color} fillRule="nonzero"></path>
            <path d="M17.25,5.25 L17.25,6.75 L13.25,6.75 C12.059136,6.75 11.0843551,7.67516159 11.0051908,8.84595119 L11,9 C11,10.190864
            11.9251616,11.1656449 13.0959512,11.2448092 L13.25,11.25 L17.25,11.25 L17.25,12.75 L13.25,12.75 C11.2457408,12.75 9.60872626,11.1776389
            9.50519801,9.19915857 L9.5,9 C9.5,6.99574083 11.0723611,5.35872626 13.0508414,5.25519801 L13.25,5.25 L17.25,5.25 Z"
            fill={color} fillRule="nonzero" transform="translate(13.375000, 9.000000) scale(-1, 1) translate(-13.375000, -9.000000) "></path>
            <rect fill={color} x="5" y="8" width="8" height="2" rx="1"></rect>
        </svg>
    )
}

export default UnindexedIcon
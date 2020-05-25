import React from "react"

import "./dropdown.scss"

import { DropDownContextProvider } from "./DropDownContext"
import DropDownBackdrop from "./DropDownBackdrop"

const DropDown = ({ children }) => {
    return (
        <DropDownContextProvider>
            <div className="dropdown">{children}</div>
            <DropDownBackdrop />
        </DropDownContextProvider>
    )
}

export default DropDown

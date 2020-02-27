import React from "react"

import "./dropdown.scss"

import {
    DropDownContextProvider,
    ReducerTypes,
    useStateValue,
} from "./DropDownContext"
import DropDownItem from "./DropDownItem"
import DropDownMenu from "./DropDownMenu"
import DropDownMenuToggle from "./DropDownMenuToggle"

const DropDown = ({ children }) => {
    return (
        <DropDownContextProvider>
            <div className="dropdown">{children}</div>
            <DropDownBackdrop />
        </DropDownContextProvider>
    )
}

const DropDownBackdrop = () => {
    const [state, dispatch] = useStateValue()
    const isDropDownOpen = state.current !== undefined

    const handleClear = () => {
        dispatch({
            type: ReducerTypes.CLEAR,
        })
    }

    return (
        <>
            {isDropDownOpen && (
                <div
                    className="click-handler"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClear()}
                    onKeyDown={() => handleClear()}
                />
            )}
        </>
    )
}

export { DropDown, DropDownItem, DropDownMenu, DropDownMenuToggle }

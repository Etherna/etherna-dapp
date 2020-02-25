import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import { useStateValue, ReducerTypes } from "./DropDownContext"
import Image from "@common/Image"

const DropDownMenu = ({ children, alignRight, menuRef, title }) => {
    const [state, dispatch] = useStateValue()
    const { history } = state
    const isDropDownOpen = state.current === menuRef

    const pop = () => {
        dispatch({
            type: ReducerTypes.POP_MENU,
            index: (history.length-1)
        })
    }

    return (
        <div
            ref={menuRef}
            className={classnames("dropdown-menu", {
                "menu-right": alignRight,
                open: isDropDownOpen,
            })}
        >
            {history.length > 1 &&
                <div className="dropdown-header">
                    <button className="btn-back" onClick={pop}>
                        <Image filename="back-icon.svg" />
                    </button>
                    <span className="ml-3">{title}</span>
                </div>
            }
            {children}
        </div>
    )
}

DropDownMenu.propTypes = {
    alignRight: PropTypes.bool,
    title: PropTypes.string,
    menuRef: PropTypes.any.isRequired,
}

export default DropDownMenu
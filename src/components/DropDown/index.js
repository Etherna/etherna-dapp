import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./dropdown.scss"

// DropDown container
const DropDown = ({ children, toggleChildren, alignRight }) => {
    const [isDropDownOpen, setDropDownOpen] = useState(false)

    return (
        <>
            <div className="dropdown">
                <div
                    className="dropdown-toggle"
                    role="button"
                    onClick={() => setDropDownOpen(!isDropDownOpen)}
                >
                    {toggleChildren}
                </div>
                <div className={classnames("dropdown-menu", {
                        "menu-right": alignRight,
                        "open": isDropDownOpen
                    })}
                >
                    {children}
                </div>
            </div>
            {isDropDownOpen && (
                <div
                    className="click-handler"
                    tabIndex="0"
                    onClick={() => setDropDownOpen(false)}
                    onKeyPress={() => setDropDownOpen(false)}
                />
            )}
        </>
    )
}

DropDown.propTypes = {
    toggleChildren: PropTypes.element,
    alignRight: PropTypes.bool,
}

// DropDown item
const DropDownItem = ({ children }) => (
    <div className="dropdown-item">{children}</div>
)

// Exports
export default DropDown

export { DropDownItem }

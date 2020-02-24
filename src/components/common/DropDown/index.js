import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./dropdown.scss"

// DropDown container
const DropDown = ({ children, toggleChildren, alignRight }) => {
    const [isDropDownOpen, setDropDownOpen] = useState(false)

    let handleToggle = () => {
        setDropDownOpen(!isDropDownOpen)
    }

    let handleKeyDown = e => {
        if (e.keyCode === 13) {
            handleToggle()
        }
    }

    return (
        <>
            <div className="dropdown">
                <div
                    className="dropdown-toggle"
                    role="button"
                    tabIndex={0}
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                >
                    {toggleChildren}
                </div>
                <div
                    className={classnames("dropdown-menu", {
                        "menu-right": alignRight,
                        open: isDropDownOpen,
                    })}
                >
                    {children}
                </div>
            </div>
            {isDropDownOpen && (
                <div
                    className="click-handler"
                    role="button"
                    tabIndex={0}
                    onClick={() => setDropDownOpen(false)}
                    onKeyDown={() => setDropDownOpen(false)}
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
const DropDownItem = ({ children, action, disabled, inactive }) => {
    let handleAction = () => {
        action && action()
    }
    let handleKeyDown = e => {
        if (e.keyCode === 13) {
            handleAction()
        }
    }
    return (
        <div
            className={classnames("dropdown-item", {
                "disabled": disabled,
                "inactive": inactive
            })}
            role="button"
            tabIndex={0}
            onClick={handleAction}
            onKeyDown={handleKeyDown}
        >
            {children}
        </div>
    )
}

DropDownItem.propTypes = {
    action: PropTypes.func,
    disabled: PropTypes.bool,
    inactive: PropTypes.bool,
}

// Exports
export default DropDown

export { DropDownItem }

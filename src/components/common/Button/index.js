import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./button.scss"

const Button = ({ children, className, size, outline, action }) => {
    const handleKeyDown = e => {
        if (e.target === document.activeElement && e.keyCode === 13 && action) {
            action()
        }
    }

    return (
        <button
            className={
                classnames("btn", className, {
                    "btn-sm": size === "small",
                    "btn-lg": size === "large",
                    "btn-outline": outline
                }
            )}
            type="button"
            onClick={action}
            onKeyDown={handleKeyDown}
        >
            {children}
        </button>
    )
}

Button.propTypes = {
    className: PropTypes.string,
    size: PropTypes.string,
    outline: PropTypes.bool,
    action: PropTypes.func,
}

Button.defaultProps = {
    className: "",
    size: "",
    outline: false,
}

export default Button
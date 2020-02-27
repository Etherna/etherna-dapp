import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./button.scss"

const Button = ({
    children,
    className,
    size,
    outline,
    aspect,
    action,
    disabled,
}) => {
    const handleKeyDown = e => {
        if (e.target === document.activeElement && e.keyCode === 13 && action) {
            action()
        }
    }

    return (
        <button
            className={classnames(
                "btn",
                {
                    "btn-sm": size === "small",
                    "btn-lg": size === "large",
                    "btn-outline": outline,
                    [`btn-${aspect}`]: aspect && aspect !== "",
                },
                className
            )}
            type="button"
            onClick={action}
            onKeyDown={handleKeyDown}
            disabled={disabled ? true : null}
        >
            {children}
        </button>
    )
}

Button.propTypes = {
    className: PropTypes.string,
    size: PropTypes.string,
    outline: PropTypes.bool,
    aspect: PropTypes.string,
    disabled: PropTypes.bool,
    action: PropTypes.func,
}

Button.defaultProps = {
    className: "",
    size: "",
    outline: false,
}

export default Button

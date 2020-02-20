import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./alert.scss"

const Alert = ({ children, style, title }) => {
    return (
        <div
            className={classnames("alert", {
                [`alert-${style}`]: style,
            })}
        >
            {title && <div className="alert-title">{title}</div>}
            <p>{children}</p>
        </div>
    )
}

Alert.propTypes = {
    style: PropTypes.string,
    title: PropTypes.string,
}

Alert.defaultProps = {
    style: "success",
}

export default Alert

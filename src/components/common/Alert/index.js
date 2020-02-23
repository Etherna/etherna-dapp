import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./alert.scss"

const Alert = ({ children, type, title }) => {
    return (
        <div
            className={classnames("alert", {
                [`alert-${type}`]: type,
            })}
        >
            {title && <div className="alert-title">{title}</div>}
            <p>{children}</p>
        </div>
    )
}

Alert.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
}

Alert.defaultProps = {
    type: "success",
}

export default Alert

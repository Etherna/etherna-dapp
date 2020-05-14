import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

const NavPillsItem = ({ children, active, onClick }) => {
    return (
        <div className={classnames(
            "nav-pill", {
                active
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

NavPillsItem.propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
}

export default NavPillsItem
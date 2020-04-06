import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./avatar.scss"
import makeBlockies from "utils/makeBlockies"
import { getResourceUrl } from "utils/swarm"

const Avatar = ({ image, address, size, showBadge }) => {
    const blockie = address ? makeBlockies(address) : null

    return (
        <div className={classnames("avatar", { badge: showBadge })}>
            <img
                src={getResourceUrl(image) || blockie}
                alt={address}
                style={{
                    width: size ? `${size}px` : null,
                    height: size ? `${size}px` : null,
                }}
            />
        </div>
    )
}

Avatar.propTypes = {
    image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(
            PropTypes.shape({
                "@type": PropTypes.string.isRequired,
                contentUrl: PropTypes.shape({
                    "/": PropTypes.string.isRequired,
                }).isRequired,
            })
        ),
        PropTypes.object,
    ]),
    address: PropTypes.string,
    size: PropTypes.number,
    showBadge: PropTypes.bool,
}

export default Avatar

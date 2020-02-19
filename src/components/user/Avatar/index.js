import React from "react"
import PropTypes from "prop-types"
import makeBlockie from "ethereum-blockies-base64"

import { getImageUrl } from "../../../utils/swarm"
import "./avatar.scss"

const Avatar = ({ image, address, size }) => {
    const blockie = address ? makeBlockie(address) : null

    return (
        <div className="avatar">
            <img
                src={getImageUrl(image) || blockie}
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
    image: PropTypes.oneOfType(
        PropTypes.string,
        PropTypes.arrayOf(
            PropTypes.shape({
                "@type": PropTypes.string.isRequired,
                contentUrl: PropTypes.shape({
                    "/": PropTypes.string.isRequired,
                }).isRequired,
            })
        )
    ),
    address: PropTypes.string,
    size: PropTypes.number,
}

export default Avatar

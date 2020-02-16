import React from "react"
import PropTypes from "prop-types"
import makeBlockie from "ethereum-blockies-base64"

import { getImageUrl } from "../../../utils/swarm"
import "./avatar.scss"

const Avatar = ({ image, address }) => {
    const blockie = address ? makeBlockie(address) : null

    return (
        <div className="avatar">
            <img src={getImageUrl(image) || blockie} />
        </div>
    )
}

Avatar.propTypes = {
    image: PropTypes.shape({
        "@type": PropTypes.string.isRequired,
        contentUrl: PropTypes.shape({
            "/": PropTypes.string.isRequired,
        }).isRequired,
    }),
    address: PropTypes.string,
}

export default Avatar

import React from "react"
import PropTypes from "prop-types"

import "./player.scss"

const Player = ({ source }) => {
    return (
        <div className="player">
            <video autoPlay={true} controls>
                <source src={source} />
            </video>
        </div>
    )
}

Player.propTypes = {
    source: PropTypes.string.isRequired,
}

export default Player

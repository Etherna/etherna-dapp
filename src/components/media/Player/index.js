import React from "react"
import PropTypes from "prop-types"

import "./player.scss"

const Player = ({ source }) => {
    return (
        <div className="player">
            <video autoPlay={false} preload="metadata" controls>
                <source src={source} />
                <track default kind="captions" />
            </video>
        </div>
    )
}

Player.propTypes = {
    source: PropTypes.string.isRequired,
}

export default Player

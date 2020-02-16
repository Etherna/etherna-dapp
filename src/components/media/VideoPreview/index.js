import React from "react"
import { Link } from "gatsby"

import "./video-preview.scss"

const VideoPreview = ({ title, hash, thumbnail, duration }) => {
    return (
        <div className="video-preview">
            <Link to={`/watch/${hash}`}>
                <div className="video-thumbnail">
                    <img src={thumbnail} />
                    <div className="video-duration">{duration}</div>
                </div>
                <h4 className="video-title">{title}</h4>
            </Link>
        </div>
    )
}

export default VideoPreview

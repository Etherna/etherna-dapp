import React from "react"
import PropTypes from "prop-types"

import "./video-grid.scss"
import VideoPreview from "../VideoPreview"

const VideoGrid = ({ label, videos }) => {
    return (
        <>
            <div className="video-grid-header">
                {label &&
                    <h3>{label}</h3>
                }
            </div>
            <div className="video-grid">
                {videos.map((v, i) => {
                    return <VideoPreview
                        title={v.title}
                        duration={v.duration}
                        hash={v.hash}
                        channel={v.channel}
                        key={v.hash + i}
                    />
                })}
            </div>
        </>
    )
}

VideoGrid.propTypes = {
    label: PropTypes.string,
    videos: PropTypes.array,
}

export default VideoGrid
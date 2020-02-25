import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./video-grid.scss"
import VideoPreview from "@components/media/VideoPreview"

const VideoGrid = ({ label, videos, mini }) => {
    const LabelTag = mini ? "h5" : "h3"
    return (
        <>
            <div className="video-grid-header">
                {label && <LabelTag>{label}</LabelTag>}
            </div>
            <div className={classnames("video-grid", { mini: mini })}>
                {videos.map((v, i) => {
                    return (
                        <VideoPreview
                            title={v.title}
                            duration={v.duration}
                            hash={v.hash}
                            profileAddress={mini ? undefined : v.profileAddress}
                            key={v.hash + i}
                        />
                    )
                })}
            </div>
        </>
    )
}

VideoGrid.propTypes = {
    label: PropTypes.string,
    videos: PropTypes.array,
    mini: PropTypes.bool,
}

export default VideoGrid

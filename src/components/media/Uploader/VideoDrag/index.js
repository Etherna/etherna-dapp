import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./video-drag.scss"
import Image from "../../../common/Image"

const VideoDrag = ({ onSelectFile }) => {
    const [isDragOver, setIsDragOver] = useState(false)

    return (
        <label htmlFor="video-input" className={classnames("drag-input", { "drag-over": isDragOver })}>
            <input
                type="file"
                id="video-input"
                accept="video/mp4,video/x-m4v"
                onChange={e => onSelectFile(e.target.files[0])}
            />
            <div className="drag-content">
                <Image filename="upload-icon-lg.svg" />
                <span className="drag-info text-lg">Drag a video</span>
                <span className="drag-info text-sm font-normal">or</span>
                <div className="btn btn-outline">Select</div>
            </div>
        </label>
    )
}

VideoDrag.propTypes = {
    onSelectFile: PropTypes.func.isRequired,
}

export default VideoDrag
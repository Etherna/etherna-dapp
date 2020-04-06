import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./file-drag.scss"

const FileDrag = ({ id, label, onSelectFile, disabled }) => {
    const [isDragOver, setIsDragOver] = useState(false)

    const updateDragOver = hasEntered => {
        if ((hasEntered && !isDragOver) || (!hasEntered && isDragOver)) {
            setIsDragOver(hasEntered)
        }
    }

    const handleDragEnter = e => {
        e.preventDefault()
        e.stopPropagation()
        updateDragOver(true)
    }

    const handleDragLeave = e => {
        e.preventDefault()
        e.stopPropagation()
        updateDragOver(false)
    }

    const handleDragOver = e => {
        e.preventDefault()
        e.stopPropagation()
        updateDragOver(true)
    }

    const handleDrop = e => {
        e.preventDefault()
        e.stopPropagation()
        updateDragOver(false)

        const files = [...e.dataTransfer.files]

        if (files && files.length > 0) {
            onSelectFile(files[0])
        }
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
        >
            <label
                htmlFor={id}
                className={classnames("drag-input", {
                    "drag-over": isDragOver,
                })}
            >
                <input
                    type="file"
                    id={id}
                    onChange={e => onSelectFile(e.target.files[0])}
                    disabled={disabled}
                />
                <div className="drag-content">
                    <img
                        src={require("svg/icons/upload-icon-lg.svg")}
                        alt=""
                    />
                    <span className="drag-info text-lg">
                        {label || "Drag here"}
                    </span>
                    <span className="drag-info text-sm font-normal">or</span>
                    <div className="btn btn-outline">Select</div>
                </div>
            </label>
        </div>
    )
}

FileDrag.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    onSelectFile: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default FileDrag

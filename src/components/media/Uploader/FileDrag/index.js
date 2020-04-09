import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./file-drag.scss"
import Alert from "@components/common/Alert"

const FileDrag = ({ id, label, onSelectFile, disabled, uploadLimit }) => {
    const [isDragOver, setIsDragOver] = useState(false)
    const [showSizeLimitError, setShowSizeLimitError] = useState(false)

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

        handleFileSelect(files)
    }

    const handleFileSelect = files => {
        if (files && files.length > 0) {
            if (!uploadLimit || files[0].size <= uploadLimit * 1024 * 1024) {
                onSelectFile(files[0])
            } else {
                setShowSizeLimitError(true)
            }
        }
    }

    return (
        <>
            {showSizeLimitError && (
                <div className="mb-2">
                    <Alert
                        title="File size exceeded"
                        type="warning"
                        onClose={() => setShowSizeLimitError(false)}
                    >
                        Your file is too large. The maximum upload size is currently {uploadLimit}MB.
                    </Alert>
                </div>
            )}
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
                        onChange={e => handleFileSelect(e.target.files)}
                        disabled={disabled}
                    />
                    <div className="drag-content">
                        <img
                            src={require("@svg/icons/upload-icon-lg.svg")}
                            alt=""
                        />
                        <span className="drag-info text-lg">
                            {label || "Drag here"}
                        </span>
                        <span className="drag-info text-sm font-normal">or</span>
                        <div className="btn btn-outline">Select</div>
                        {uploadLimit && (
                            <small className="bold">{uploadLimit}MB</small>
                        )}
                    </div>
                </label>
            </div>
        </>
    )
}

FileDrag.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    onSelectFile: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    uploadLimit: PropTypes.number,
}

export default FileDrag

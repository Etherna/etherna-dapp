import React, { useState, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import Modal from "@components/common/Modal"
import Button from "@components/common/Button"
import { finishCropping } from "@state/actions/enviroment/cropImage"

const ImageCropModal = () => {
    const imgRef = useRef(null)
    const { imageType, image } = useSelector(state => state.env)
    const [crop, setCrop] = useState({
        unit: 'px',
        width: imageType === "avatar" ? 500 : undefined,
        height: imageType === "avatar" ? undefined : 450,
        aspect: imageType === "avatar" ? 1 : 1920 / 450
    })

    const onLoad = useCallback(img => {
        imgRef.current = img
    }, [])

    const handleCancel = () => {
        finishCropping(null)
    }

    const handleContinue = () => {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height

        const scaledCrop = {
            ...crop,
            x: crop.x * scaleX,
            y: crop.y * scaleY,
            width: crop.width * scaleX,
            height: crop.height * scaleY,
        }
        finishCropping(scaledCrop)
    }

    return (
        <Modal show={true} showCloseButton={false}>
            <div className="modal-header">
                <h4 className="modal-title mx-auto">Crop the image</h4>
            </div>
            <div>
                <small className="text-gray-500">
                    <span>x: {crop.x}, </span>
                    <span>y: {crop.y}, </span>
                    <span>width: {crop.width}, </span>
                    <span>height: {crop.height}</span>
                </small>
            </div>
            <div className="my-6">
                <ReactCrop
                    src={image}
                    onImageLoaded={onLoad}
                    crop={crop}
                    onChange={crop => setCrop(crop)}
                />
            </div>
            <div className="flex">
                <div className="ml-auto">
                    <Button
                        action={handleCancel}
                        aspect="secondary"
                        size="small"
                    >
                        Cancel
                    </Button>
                    <Button
                        action={handleContinue}
                        size="small"
                        className="ml-3"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ImageCropModal
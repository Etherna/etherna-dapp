import React, { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop } from "react-image-crop"

import Modal from "@components/common/Modal"
import Button from "@components/common/Button"
import useSelector from "@state/useSelector"
import { finishCropping } from "@state/actions/enviroment/cropImage"

type ImageCropModalProps = {
  show?: boolean
}

const ImageCropModal = ({ show = false }: ImageCropModalProps) => {
  const imgRef = useRef<HTMLImageElement>()
  const { imageType, image } = useSelector(state => state.env)
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: imageType === "avatar" ? 500 : undefined,
    height: imageType === "avatar" ? undefined : 450,
    aspect: imageType === "avatar" ? 1 : 1920 / 450,
  })

  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img
  }, [])

  const handleCancel = () => {
    finishCropping(undefined)
  }

  const handleContinue = () => {
    if (!imgRef.current) return

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    const scaledCrop = {
      ...crop,
      x: (crop.x || 0) * scaleX,
      y: (crop.y || 0) * scaleY,
      width: (crop.width || 0) * scaleX,
      height: (crop.height || 0) * scaleY,
    }
    finishCropping(scaledCrop)
  }

  return (
    <Modal show={show} showCloseButton={false}>
      <div className="modal-header">
        <h4 className="modal-title mx-auto">Crop the image</h4>
      </div>
      <div className="my-6">
        <ReactCrop
          src={image!}
          onImageLoaded={onLoad}
          crop={crop}
          onChange={crop => setCrop(crop)}
        />
      </div>
      <div className="flex">
        <div className="ml-auto">
          <Button action={handleCancel} aspect="secondary" size="small">
            Cancel
          </Button>
          <Button action={handleContinue} size="small" className="ml-3">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageCropModal

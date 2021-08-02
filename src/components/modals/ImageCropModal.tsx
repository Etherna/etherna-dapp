/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, { Crop } from "react-image-crop"

import Modal from "@common/Modal"
import Button from "@common/Button"
import useSelector from "@state/useSelector"
import { useImageCrop } from "@state/hooks/ui"

type ImageCropModalProps = {
  show?: boolean
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ show = false }) => {
  const imgRef = useRef<HTMLImageElement>()
  const { imageType, image } = useSelector(state => state.ui)
  const [crop, setCrop] = useState<Crop>()
  const { finishCropping } = useImageCrop()

  useEffect(() => {
    setCrop({
      unit: "px",
      width: imageType === "avatar" ? 500 : undefined,
      height: imageType === "avatar" ? undefined : 450,
      aspect: imageType === "avatar" ? 1 : 1920 / 450,
    })
  }, [imageType])

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
      ...(crop ?? {}),
      x: (crop?.x ?? 0) * scaleX,
      y: (crop?.y ?? 0) * scaleY,
      width: (crop?.width ?? 0) * scaleX,
      height: (crop?.height ?? 0) * scaleY,
    }
    finishCropping(scaledCrop)
  }

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={true}
      title="Crop the image"
      footerButtons={
        <Button onClick={handleContinue}>
          Done
        </Button>
      }
      onClose={handleCancel}
    >
      <div className="flex justify-center my-6">
        <ReactCrop
          src={image!}
          onImageLoaded={onLoad}
          crop={crop}
          onChange={crop => setCrop(crop)}
        />
      </div>
    </Modal>
  )
}

export default ImageCropModal

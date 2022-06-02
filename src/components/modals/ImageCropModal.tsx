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

import React, { useState, useRef } from "react"
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop"

import Modal from "@/components/common/Modal"
import Button from "@/components/common/Button"
import useSelector from "@/state/useSelector"
import { useImageCrop } from "@/state/hooks/ui"

type ImageCropModalProps = {
  show?: boolean
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ show = false }) => {
  const imgRef = useRef<HTMLImageElement>()
  const { imageType, image } = useSelector(state => state.ui)
  const [crop, setCrop] = useState<Crop>()
  const { finishCropping } = useImageCrop()

  const aspectRatio = imageType === "avatar" ? 1 : 1920 / 450

  const imageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget

    const { width, height } = e.currentTarget

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "px",
          width,
          height,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    )

    setCrop(crop)
  }

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
      large
    >
      <div className="flex justify-center my-6">
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          aspect={aspectRatio}
        >
          {image && (
            <img src={image} onLoad={imageLoaded} />
          )}
        </ReactCrop>
      </div>
    </Modal>
  )
}

export default ImageCropModal

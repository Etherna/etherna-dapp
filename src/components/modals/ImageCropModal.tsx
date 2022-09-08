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

import React, { useState, useMemo, useCallback } from "react"
import type { Crop } from "react-image-crop"

import ImageCropper from "@/components/media/ImageCropper"
import { Button, Modal } from "@/components/ui/actions"
import { useImageCrop } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"

type ImageCropModalProps = {
  show?: boolean
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ show = false }) => {
  const { imageType, image } = useSelector(state => state.ui)
  const [crop, setCrop] = useState<Crop>()
  const { finishCropping } = useImageCrop()

  const aspectRatio = useMemo(() => {
    return imageType === "avatar" ? 1 : 1920 / 450
  }, [imageType])

  const handleCancel = useCallback(() => {
    finishCropping(undefined)
  }, [finishCropping])

  const handleContinue = useCallback(() => {
    finishCropping(crop)
  }, [crop, finishCropping])

  return (
    <Modal
      show={show}
      title="Crop the image"
      footerButtons={<Button onClick={handleContinue}>Done</Button>}
      onClose={handleCancel}
      showCancelButton
      large
    >
      <ImageCropper
        imageSrc={image}
        aspectRatio={aspectRatio}
        circular={imageType === "avatar"}
        onChange={setCrop}
      />
    </Modal>
  )
}

export default ImageCropModal

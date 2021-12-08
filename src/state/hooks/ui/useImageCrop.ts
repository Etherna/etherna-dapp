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
 */

import { Dispatch } from "redux"
import { useDispatch, useStore } from "react-redux"
import { Crop } from "react-image-crop"

import { AppState } from "@state/types"
import { UIActionTypes, UIActions } from "@state/reducers/uiReducer"
import { fileToDataURL } from "@utils/buffer"

const useImageCrop = () => {
  const getState = useStore<AppState>().getState
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const cropImage = async (file: File, type: "avatar" | "cover") => {
    const img = await fileToDataURL(file)

    dispatch({
      type: UIActionTypes.SET_CROP_IMAGE,
      imageType: type,
      image: img,
    })
    dispatch({
      type: UIActionTypes.TOGGLE_IMAGE_CROPPER,
      isCroppingImage: true,
    })

    const image = await getCroppedImage(img, getState)

    dispatch({
      type: UIActionTypes.UPDATE_IMAGE_CROP,
    })
    dispatch({
      type: UIActionTypes.TOGGLE_IMAGE_CROPPER,
      isCroppingImage: false,
    })
    dispatch({
      type: UIActionTypes.SET_CROP_IMAGE,
      imageType: type,
      image: img,
    })

    return image
  }

  const finishCropping = (cropData: Partial<Crop> | undefined) => {
    dispatch({
      type: UIActionTypes.UPDATE_IMAGE_CROP,
      imageCrop: cropData,
    })

    if (!cropData) {
      dispatch({
        type: UIActionTypes.TOGGLE_IMAGE_CROPPER,
        isCroppingImage: false,
      })
    }
  }

  return {
    cropImage,
    finishCropping
  }
}


const getCroppedImage = async (src: string, getState: () => AppState) => {
  const cropData = await waitCropData(getState)
  if (cropData) {
    const image = await applyImageCropping(src, cropData)
    return image
  }
  return null
}

const waitCropData = (getState: () => AppState) =>
  new Promise<Partial<Crop>>(resolve => {
    const id = setInterval(() => {
      const { imageCrop } = getState().ui
      if (imageCrop !== undefined) {
        clearInterval(id)
        resolve(imageCrop)
      }
    }, 1000)
  })

const applyImageCropping = (src: string, cropData: Partial<Crop>) =>
  new Promise<Blob | null>(resolve => {
    let image = new Image()
    image.src = src
    image.onload = async () => {
      const imageBlob = await getCroppedBlob(image, cropData)
      resolve(imageBlob)
    }
  })

const getCroppedBlob = (image: CanvasImageSource, crop: Partial<Crop>, fileName = "image") => {
  const canvas = document.createElement("canvas")
  canvas.width = crop.width || 0
  canvas.height = crop.height || 0
  const ctx = canvas.getContext("2d")!

  const x = crop.x || 0
  const y = crop.y || 0
  const width = crop.width || 0
  const height = crop.height || 0

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  // As a blob
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(
      blob => {
        if (blob) {
          (blob as any).name = fileName
        }
        resolve(blob)
      },
      "image/jpeg",
      1
    )
  })
}


export default useImageCrop

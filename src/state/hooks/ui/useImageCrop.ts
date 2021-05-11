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
      type: UIActionTypes.UI_SET_CROP_IMAGE,
      imageType: type,
      image: img,
    })
    dispatch({
      type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
      isCroppingImage: true,
    })

    const image = await getCroppedImage(img, getState)

    dispatch({
      type: UIActionTypes.UI_UPDATE_IMAGE_CROP,
    })
    dispatch({
      type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
      isCroppingImage: false,
    })
    dispatch({
      type: UIActionTypes.UI_SET_CROP_IMAGE,
      imageType: type,
      image: img,
    })

    return image
  }

  const finishCropping = (cropData: Crop|undefined) => {
    dispatch({
      type: UIActionTypes.UI_UPDATE_IMAGE_CROP,
      imageCrop: cropData,
    })

    if (!cropData) {
      dispatch({
        type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
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
  new Promise<Crop>(resolve => {
    const id = setInterval(() => {
      const { imageCrop } = getState().ui
      if (imageCrop !== undefined) {
        clearInterval(id)
        resolve(imageCrop)
      }
    }, 1000)
  })

const applyImageCropping = (src: string, cropData: Crop) =>
  new Promise<Blob|null>(resolve => {
    let image = new Image()
    image.src = src
    image.onload = async () => {
      const imageBlob = await getCroppedBlob(image, cropData)
      resolve(imageBlob)
    }
  })

const getCroppedBlob = (image: CanvasImageSource, crop: Crop, fileName = "image") => {
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
  return new Promise<Blob|null>(resolve => {
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

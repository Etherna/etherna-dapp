import { Crop } from "react-image-crop"

import { store } from "@state/store"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const finishCropping = (cropData: Crop|undefined) => {
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_IMAGE_CROP,
    imageCrop: cropData,
  })
}

export const cropImage = async (file: File, type: string) => {
  const img = await toBase64(file)

  store.dispatch({
    type: EnvActionTypes.ENV_SET_CROP_IMAGE,
    imageType: type,
    image: img,
  })
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
    isCroppingImage: true,
  })

  const image = await getCroppedImage(img)

  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
    isCroppingImage: false,
  })
  store.dispatch({
    type: EnvActionTypes.ENV_SET_CROP_IMAGE,
    imageType: type,
    image: img,
  })

  return image
}

const getCroppedImage = async (src: string) => {
  const cropData = await waitCropData()
  if (cropData) {
    const image = await applyImageCropping(src, cropData)
    return image
  }
  return null
}

const waitCropData = () =>
  new Promise<Crop>(resolve => {
    const waitFunc = () => {
      setTimeout(() => {
        const { imageCrop } = store.getState().env
        if (imageCrop !== undefined) {
          store.dispatch({
            type: EnvActionTypes.ENV_UPDATE_IMAGE_CROP,
          })
          resolve(imageCrop)
        } else {
          waitFunc()
        }
      }, 1000)
    }
    waitFunc()
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

  // As Base64 string
  // const base64Image = canvas.toDataURL('image/jpeg')

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

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

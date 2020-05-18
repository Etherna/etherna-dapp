import { store } from "@state/store"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const finishCropping = cropData => {
    store.dispatch({
        type: EnvActionTypes.UPDATE_IMAGE_CROP,
        imageCrop: cropData
    })
}

export const cropImage = async (file, type) => {
    const img = await toBase64(file)

    store.dispatch({
        type: EnvActionTypes.SET_CROP_IMAGE,
        imageType: type,
        image: img
    })
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
        isCroppingImage: true
    })

    const image = await getCroppedImage(img)

    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_IMAGE_CROPPER,
        isCroppingImage: false
    })
    store.dispatch({
        type: EnvActionTypes.SET_CROP_IMAGE
    })

    return image
}

const getCroppedImage = async src => {
    const cropData = await waitCropData()
    if (cropData) {
        const image = await applyImageCropping(src, cropData)
        return image
    }
    return null
}

const waitCropData = () => new Promise(resolve => {
    const waitFunc = () => {
        setTimeout(() => {
            const { imageCrop } = store.getState().env
            if (imageCrop !== undefined) {
                store.dispatch({
                    type: EnvActionTypes.UPDATE_IMAGE_CROP
                })
                resolve(imageCrop)
            } else {
                waitFunc()
            }
        }, 1000)
    }
    waitFunc()
})

const applyImageCropping = (src, cropData) => new Promise(resolve => {
    let image = new Image()
    image.src = src
    image.onload = async () => {
        const imageBlob = await getCroppedBlob(image, cropData)
        resolve(imageBlob)
    }
})

const getCroppedBlob = (image, crop, fileName = "image") => {
    const canvas = document.createElement('canvas')
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
    )

    // As Base64 string
    // const base64Image = canvas.toDataURL('image/jpeg')

    // As a blob
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            blob.name = fileName
            resolve(blob)
        }, 'image/jpeg', 1)
    })
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
})
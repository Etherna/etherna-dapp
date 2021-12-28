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

import { isBlurhashValid, encode, decode } from "blurhash"

export const blurHashToDataURL = (hash: string) => {
  if (!hash || !isBlurhashValid(hash).result) {
    // fallback to random blur hash
    hash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
  }

  const pixels = decode(hash, 32, 32)
  const image = getDataUrlFromArr(pixels, 32, 32)
  return image
}

export const imageToBlurHash = async (image: ArrayBuffer, imageWidth: number, imageHeight: number) => {
  const data = await getImageData(image, imageWidth, imageHeight)
  return encode(data, imageWidth, imageHeight, 4, 4)
}

const getDataUrlFromArr = (pixels: Uint8ClampedArray, width: number, height: number) => {
  if (!width || !height) {
    width = height = Math.sqrt(pixels.length / 4)
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = width
  canvas.height = height

  const imgData = ctx.createImageData(width, height)
  imgData.data.set(pixels)
  ctx.putImageData(imgData, 0, 0)

  return canvas.toDataURL()
}

const getImageData = async (imageData: ArrayBuffer, width: number, height: number) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  const image = await loadImage(imageData)
  image && ctx.drawImage(image, 0, 0)
  return ctx.getImageData(0, 0, width, height).data
}

const loadImage = async (data: ArrayBuffer) => {
  return new Promise<HTMLImageElement | null>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(null)
    img.src = URL.createObjectURL(new Blob([data]))
  })
}

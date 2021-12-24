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

import Axios from "axios"
import imageResize from "image-resizer-js"

import SwarmBeeClient, { MultipleFileUpload } from "@classes/SwarmBeeClient"
import { bufferToDataURL, fileToBuffer } from "@utils/buffer"
import type { SwarmImageUploadOptions, SwarmImageWriterOptions } from "./types"
import type { SwarmImageRaw } from "@definitions/swarm-image"

/**
 * Handles upload of images on swarm and created responsive source
 */
export default class SwarmImageWriter {
  imageRaw?: SwarmImageRaw

  private beeClient: SwarmBeeClient
  private isResponsive: boolean
  private responsiveSizes: number[]
  private file: File

  static defaultResponsiveSizes = [480, 768, 1024, 1536]

  constructor(file: File, opts: SwarmImageWriterOptions) {
    this.beeClient = opts.beeClient
    this.responsiveSizes = opts.responsiveSizes ?? SwarmImageWriter.defaultResponsiveSizes
    this.isResponsive = opts.isResponsive ?? false
    this.file = file
  }

  // Public methods

  /**
   * Generate a Data URL string from the file
   */
  async getFilePreview(): Promise<string> {
    return await bufferToDataURL(await fileToBuffer(this.file))
  }

  /**
   * Upload the image(s) data on swarm
   * 
   * @param options Upload options
   * @returns The raw image object
   */
  async upload(options?: SwarmImageUploadOptions): Promise<SwarmImageRaw> {
    const { blurredBase64, imageAspectRatio, responsiveSourcesData } = await this.generateImages()

    const imageRaw: SwarmImageRaw = {
      blurredBase64: blurredBase64,
      aspectRatio: imageAspectRatio,
      sources: {}
    }

    const batchId = await this.beeClient.getBatchId()
    const fetch = this.beeClient.getFetch({
      onUploadProgress: e => {
        if (options?.onUploadProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          options.onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (options?.onCancelToken) {
          options.onCancelToken(c)
        }
      }),
    })

    const uploads: MultipleFileUpload = Object.values(responsiveSourcesData).map(data => ({
      buffer: data,
      type: this.file.type,
    }))

    // upload files and retrieve the new reference
    const references = await this.beeClient.uploadMultipleFiles(batchId, uploads, { fetch })

    // update raw image object
    imageRaw.sources = Object.keys(responsiveSourcesData).reduce(
      (obj, size, i) => ({
        ...obj,
        [size]: references[i].reference,
      }),
      imageRaw.sources
    )

    this.imageRaw = imageRaw
    return imageRaw
  }

  // Private methods

  /**
   * Generate the preview, base64 and responsive images from the selected file
   */
  private async generateImages() {
    const originalImageData = await fileToBuffer(this.file)
    const imageSize = await this.getFileImageSize(originalImageData)

    const blurredBase64 = await this.imageToBlurredBase64(originalImageData)
    const imageAspectRatio = imageSize.width / imageSize.height

    const responsiveSourcesData: { [size: `${number}w`]: Uint8Array } = {
      [`${imageSize.width}w`]: new Uint8Array(originalImageData)
    }

    if (this.isResponsive) {
      const inferiorSizes = this.responsiveSizes.filter(size => size < imageSize.width)
      for (const size of inferiorSizes) {
        const data = await this.imageToResponsiveSize(originalImageData, size)
        responsiveSourcesData[`${size}w`] = new Uint8Array(data)
      }
    }

    return {
      blurredBase64,
      imageAspectRatio,
      responsiveSourcesData
    }
  }

  getFileImageSize(buffer: ArrayBuffer) {
    return new Promise<{ width: number, height: number }>(async (resolve, reject) => {
      try {
        const dataURL = await bufferToDataURL(buffer)
        const img = new Image()
        img.onload = function () {
          resolve({
            width: img.width,
            height: img.height
          })
        }
        img.onerror = reject
        img.src = dataURL
      } catch (error: any) {
        reject(error)
      }
    })
  }

  async imageToBlurredBase64(image: ArrayBuffer) {
    const data = await imageResize(image, {
      maxWidth: 10,
      quality: 25,
    })
    return await bufferToDataURL(data)
  }

  async imageToResponsiveSize(image: ArrayBuffer, width: number) {
    return await imageResize(image, {
      maxWidth: width,
      quality: 99,
      type: this.file.type,
    })
  }
}
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

import imageResize from "image-resizer-js"

import SwarmImageIO from "."
import type { Reference } from "../BeeClient/types"
import type { SwarmImageUploadOptions, SwarmImageWriterOptions } from "./types"
import type BeeClient from "@/classes/BeeClient"
import type { SwarmImageRaw } from "@/definitions/swarm-image"
import { imageToBlurHash } from "@/utils/blur-hash"
import { bufferToDataURL, fileToBuffer } from "@/utils/buffer"

/**
 * Handles upload of images on swarm and created responsive source
 */
export default class SwarmImageWriter {
  imageRaw?: SwarmImageRaw

  private beeClient: BeeClient
  private isResponsive: boolean
  private responsiveSizes: number[]
  private file: File
  private preGenerateImages?: Awaited<ReturnType<typeof this.generateImages>>

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
   * Pregenerate images and return the total size of the images,
   * used to calculate the best postage batch
   */
  async pregenerateImages(): Promise<number> {
    this.preGenerateImages = await this.generateImages()
    return Object.values(this.preGenerateImages.responsiveSourcesData).reduce(
      (acc, cur) => acc + cur.length,
      0
    )
  }

  /**
   * Upload the image(s) data on swarm
   *
   * @param options Upload options
   * @returns The raw image object
   */
  async upload(options?: SwarmImageUploadOptions): Promise<SwarmImageRaw> {
    const { blurhash, imageAspectRatio, responsiveSourcesData } =
      this.preGenerateImages ?? (await this.generateImages())

    const imageRaw: SwarmImageRaw = {
      blurhash,
      aspectRatio: imageAspectRatio,
      sources: {},
      v: SwarmImageIO.lastVersion,
    }

    const batchId = options?.batchId ?? (await this.beeClient.stamps.fetchBestBatchId())

    // upload files and retrieve the new reference
    let results: Reference[] = []
    let multipleCompletion = 0
    const responsiveSources = Object.entries(responsiveSourcesData)
    for (const [size, data] of responsiveSources) {
      const result = await this.beeClient.bzz.upload(data, {
        batchId,
        onUploadProgress: completion => {
          if (options?.onUploadProgress) {
            multipleCompletion += completion * 100
            options.onUploadProgress(multipleCompletion / responsiveSources.length)
          }
        },
        signal: options?.signal,
        contentType: this.file.type,
        headers: {
          "x-etherna-reason": `image-source-${size}-upload`,
        },
      })
      results.push(result.reference)
    }

    // update raw image object
    imageRaw.sources = Object.keys(responsiveSourcesData).reduce(
      (obj, size, i) => ({
        ...obj,
        [size]: results[i],
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

    const blurhash = await imageToBlurHash(originalImageData, imageSize.width, imageSize.height)
    const imageAspectRatio = imageSize.width / imageSize.height

    const responsiveSourcesData: { [size: `${number}w`]: Uint8Array } = {
      [`${imageSize.width}w`]: new Uint8Array(originalImageData),
    }

    if (this.isResponsive) {
      const inferiorSizes = this.responsiveSizes.filter(size => size < imageSize.width)
      for (const size of inferiorSizes) {
        const data = await this.imageToResponsiveSize(originalImageData, size)
        responsiveSourcesData[`${size}w`] = new Uint8Array(data)
      }
    }

    return {
      blurhash,
      imageAspectRatio,
      responsiveSourcesData,
    }
  }

  getFileImageSize(buffer: ArrayBuffer) {
    return new Promise<{ width: number; height: number }>(async (resolve, reject) => {
      try {
        const dataURL = await bufferToDataURL(buffer)
        const img = new Image()
        img.onload = function () {
          resolve({
            width: img.width,
            height: img.height,
          })
        }
        img.onerror = reject
        img.src = dataURL
      } catch (error: any) {
        reject(error)
      }
    })
  }

  async imageToResponsiveSize(image: ArrayBuffer, width: number) {
    return await imageResize(image, {
      maxWidth: width,
      quality: 99,
      type: this.file.type,
    })
  }
}

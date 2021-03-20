import Axios, { AxiosRequestConfig } from "axios"
import { Collection } from "@ethersphere/bee-js"
import imageResize from "image-resizer-js"

import { SwarmImageRaw, SwarmImageUploadOptions } from "./types"
import SwarmBeeClient from "@classes/SwarmBeeClient"
import { bufferToDataURL, fileToBuffer } from "@utils/buffer"

type SwarmImageOptions = {
  beeClient: SwarmBeeClient
  isResponsive?: boolean
  responsiveSizes?: number[]
}

/**
 * Load an image object and handles responsive images
 */
export default class SwarmImage {
  isResponsive: boolean
  responsiveSizes: number[]

  imageRaw?: SwarmImageRaw
  blurredBase64?: string
  originalSource: string
  responsiveSources?: { [size: string]: string }
  filePreview?: string

  static defaultResponsiveSizes = [480, 768, 1024, 1536]

  private beeClient: SwarmBeeClient
  private originalImageData?: ArrayBuffer
  private responsiveSourcesData?: { [size: string]: ArrayBuffer }

  constructor(image: SwarmImageRaw|undefined, opts: SwarmImageOptions) {
    this.beeClient = opts.beeClient
    this.responsiveSizes = opts.responsiveSizes ?? SwarmImage.defaultResponsiveSizes
    this.isResponsive = opts.isResponsive ?? false
    this.originalSource = ""

    if (image) {
      this.imageRaw = image
      this.isResponsive = image["@type"] === "responsiveImage"
      this.blurredBase64 = image.blurredBase64
      this.originalSource = this.isResponsive && image.sources
        ? this.beeClient.getBzzUrl(image.sources.original)
        : this.beeClient.getFileUrl(image.value)
      this.responsiveSources = this.isResponsive && image.sources
        ? Object.keys(image.sources).reduce((obj, size) => ({
          ...obj,
          [size]: this.beeClient.getBzzUrl(image.sources![size])
        }), {})
        : undefined
    }
  }


  // Props
  get responsivePaths(): string[] {
    return Object.keys(this.responsiveSources ?? []).concat("original")
  }

  get srcset(): string | null {
    if (!this.responsiveSources) return null

    return Object.keys(this.responsiveSources).reduce((srcset, size) => `${srcset} ${size},`, "")
  }


  // Public methods

  /**
   * Set the file of the image
   * @param image File of the image to upload
   */
  async setImageData(image: File|ArrayBuffer) {
    if (image instanceof File) {
      this.originalImageData = await fileToBuffer(image)
    } else {
      this.originalImageData = image
    }
  }

  /**
   * Generate the preview, base64 and responsive images from the selected file
   */
  async generateImages() {
    if (!this.originalImageData) throw new Error("Load a file to upload before")

    const maxWidth = await this.getFileImageWidth(this.originalImageData)

    this.filePreview = await bufferToDataURL(this.originalImageData)
    this.responsiveSourcesData = this.responsiveSizes.filter(size => size < maxWidth).reduce(async (obj, size) => ({
      ...obj,
      [`${size}w`]: await this.imageToResponsiveSize(this.originalImageData!, size)
    }), {})
  }

  /**
   * Remove file and the cached buffers of the responsive images
   */
  clear() {
    this.originalImageData = undefined
    this.responsiveSourcesData = undefined
    this.filePreview = undefined
  }

  /**
   * Upload the image(s) data on swarm
   * @param options Upload options
   * @returns The raw image object
   */
  async upload(options?: SwarmImageUploadOptions) {
    if (!this.originalImageData) throw new Error("Load a file to upload before")

    await this.generateImages()

    const { reference, path, onUploadProgress, onCancelToken } = options ?? {}

    const imageRaw: SwarmImageRaw = {
      "@type": this.isResponsive ? "responsiveImage" : "image",
      blurredBase64: this.blurredBase64,
      value: "TBD"
    }

    const axiosOptions: AxiosRequestConfig = {
      onUploadProgress: e => {
        if (onUploadProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (onCancelToken) {
          onCancelToken(c)
        }
      }),
    }

    let newReference = reference

    if (reference || this.isResponsive) {
      // dir setup
      const sizes = Object.keys(this.responsiveSourcesData!)
      const uploads: Collection<Uint8Array> = sizes.concat(["original"]).map(size => ({
        path: size,
        data: new Uint8Array(size === "original" ? this.originalImageData! : this.responsiveSourcesData![size])
      }))

      // upload files and retrieve the new reference
      newReference = await this.beeClient.uploadToDir(uploads, { reference })

      // update raw image object
      imageRaw.value = `${newReference}${path ? `/${path}` : ``}/original`
      imageRaw.sources = {
        original: imageRaw.value
      }
      imageRaw.sources = sizes.reduce((obj, size) => ({
        ...obj,
        [size]: `${newReference}${path ? `/${path}` : ``}/${size}`
      }), imageRaw.sources)
    } else {
      // upload file and retrieve the new reference
      newReference = await this.beeClient.uploadFile(new Uint8Array(this.originalImageData!), undefined, {
        axiosOptions
      })

      // update raw image object
      imageRaw.value = newReference
    }

    this.clear()

    this.imageRaw = imageRaw

    return newReference
  }


  // Private methods

  getFileImageWidth(buffer: ArrayBuffer) {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const dataURL = await bufferToDataURL(buffer)
        const img = new Image()
        img.onload = function() {
          resolve(img.width)
        }
        img.onerror = reject
        img.src = dataURL

      } catch (error) {
        reject(error)
      }
    })
  }

  async imageToBlurredBase64(image: ArrayBuffer) {
    const data = await imageResize(image, {
      maxWidth: 10,
      quality: 50,
    })
    return await bufferToDataURL(data)
  }

  async imageToResponsiveSize(image: ArrayBuffer, width: number) {
    return await imageResize(image, {
      maxWidth: width,
      quality: 99,
    })
  }

}

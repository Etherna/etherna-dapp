import imageResize from "image-resizer-js"

import { SwarmImageRaw, SwarmImageUploadOptions } from "./types"
import SwarmBeeClient, { MultipleFileUpload } from "@classes/SwarmBeeClient"
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
  originalImageSize?: [width: number, height: number]
  responsiveSources?: { [size: string]: string }
  filePreview?: string

  static defaultResponsiveSizes = [480, 768, 1024, 1536]

  private beeClient: SwarmBeeClient

  // temp data
  private originalImageData?: ArrayBuffer
  private responsiveSourcesData?: { [size: string]: ArrayBuffer }
  private contentType?: string

  constructor(image: SwarmImageRaw | undefined, opts: SwarmImageOptions) {
    this.beeClient = opts.beeClient
    this.responsiveSizes = opts.responsiveSizes ?? SwarmImage.defaultResponsiveSizes
    this.isResponsive = opts.isResponsive ?? false
    this.originalSource = ""

    if (image) {
      this.imageRaw = image
      this.isResponsive = image["@type"] === "responsiveImage"
      this.blurredBase64 = image.blurredBase64
      this.originalSource = this.beeClient.getFileUrl(image.value)
      this.originalImageSize = image.originalSize

      const responsiveUrls =
        this.isResponsive && image.sources
          ? Object.keys(image.sources).reduce(
            (obj, size) => ({
              ...obj,
              [size]: this.beeClient.getFileUrl(image.sources![size]),
            }),
            {}
          )
          : undefined
      this.responsiveSources = responsiveUrls
    }
  }

  // Props
  get responsivePaths(): string[] {
    return Object.keys(this.responsiveSources ?? [])
  }

  get srcset(): string | undefined {
    if (!this.responsiveSources) return undefined

    const responsiveSources = this.responsiveSources
    const resposiveSizes = Object.keys(responsiveSources)

    return resposiveSizes.reduce(
      (srcset, size) => `${srcset ? srcset + "," : ""} ${size} ${responsiveSources[size]}`, ""
    )
  }

  // Public methods

  /**
   * Set the file of the image
   * @param image File of the image to upload
   */
  async setImageData(image: File | Blob | ArrayBuffer) {
    if (image instanceof File || image instanceof Blob) {
      this.originalImageData = await fileToBuffer(image as File)
      this.contentType = image.type
    } else if (image instanceof ArrayBuffer) {
      this.originalImageData = image
      this.contentType = undefined
    } else {
      throw new Error("Input image must be a File, Blob or Array Buffer")
    }
  }

  /**
   * Generate the preview, base64 and responsive images from the selected file
   */
  async generateImages() {
    const imageSize = await this.getFileImageSize(this.originalImageData!)

    this.filePreview = await bufferToDataURL(this.originalImageData!)
    this.blurredBase64 = await this.imageToBlurredBase64(this.originalImageData!)
    this.originalImageSize = [imageSize.width, imageSize.height]

    const responsiveSourcesData: { [key: string]: ArrayBuffer } = {}
    const inferiorSizes = this.responsiveSizes.filter(size => size < imageSize.width)

    for (const size of inferiorSizes) {
      const data = await this.imageToResponsiveSize(this.originalImageData!, size)
      responsiveSourcesData[`${size}w`] = data
    }

    this.responsiveSourcesData = { [`${imageSize.width}w`]: this.originalImageData!, ...responsiveSourcesData }
  }

  /**
   * Remove file and the cached buffers of the responsive images
   */
  clear() {
    this.originalImageData = undefined
    this.responsiveSourcesData = undefined
    this.contentType = undefined
  }

  /**
   * Upload the image(s) data on swarm
   * @param options Upload options
   * @returns The raw image object
   */
  async upload(options?: SwarmImageUploadOptions) {
    if (!this.originalImageData) throw new Error("Load a file to upload before")

    await this.generateImages()

    const imageRaw: SwarmImageRaw = {
      "@type": this.isResponsive ? "responsiveImage" : "image",
      blurredBase64: this.blurredBase64,
      value: "",
    }

    let imgReference = ""

    if (this.isResponsive) {
      // dir setup
      const sizes = Object.keys(this.responsiveSourcesData!)
      const uploads: MultipleFileUpload = sizes.map(size => ({
        buffer: new Uint8Array(this.responsiveSourcesData![size]),
        type: this.contentType
      }))

      // upload files and retrieve the new reference
      const references = await this.beeClient.uploadMultipleFiles(uploads)
      imgReference = references[0]

      // update raw image object
      imageRaw.value = references[0]
      imageRaw.originalSize = this.originalImageSize
      imageRaw.sources = sizes.reduce(
        (obj, size, i) => ({
          ...obj,
          [size]: references[i],
        }),
        imageRaw.sources
      )
    } else {
      // upload file and retrieve the new reference
      imgReference = await this.beeClient.uploadFile(
        new Uint8Array(this.originalImageData!),
        undefined,
        { contentType: this.contentType }
      )

      // update raw image object
      imageRaw.value = imgReference
      imageRaw.originalSize = this.originalImageSize
    }

    this.clear()

    this.imageRaw = imageRaw

    // return original image reference for preview
    return imgReference
  }

  getOptimizedSrc(size?: number): string {
    if (!this.responsiveSources || !size) return this.originalSource

    const screenSize = size * (window.devicePixelRatio ?? 1)
    const sizes = Object.keys(this.responsiveSources).map(size => +size.replace(/w$/, "")).sort()
    const largest = sizes[sizes.length - 1]

    if (size > largest) return this.responsiveSources[largest + "w"]

    const optimized = sizes.find(size => size > screenSize)
    const optimizedSrc = optimized ? this.responsiveSources[optimized + "w"] : this.responsiveSources[largest + "w"]

    return optimizedSrc
  }

  // Private methods

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
      } catch (error) {
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
    })
  }
}

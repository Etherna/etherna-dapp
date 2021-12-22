export type SwarmImageRaw = {
  /** Image aspect ratio (width / height) */
  aspectRatio: number
  /** Blurred & Low resolution base64 of the original image  */
  blurredBase64: string
  /** Sources of image in different resolutions */
  sources: {
    [size: `${number}w`]: string
  }
}

export type SwarmImage = SwarmImageRaw & {
  /** img src url */
  src: string
  /** img srcset urls */
  srcset?: string
}

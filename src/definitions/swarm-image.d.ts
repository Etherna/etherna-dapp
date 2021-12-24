export type SwarmImageRaw = {
  /** Image aspect ratio (width / height) */
  aspectRatio: number
  /** Blurhash value  */
  blurhash: string
  /** Sources of image in different resolutions */
  sources: {
    [size: `${number}w`]: string
  }
}

export type SwarmImage = SwarmImageRaw & {
  /** Data URL of the blur-hash  */
  blurredBase64: string
  /** img src url */
  src: string
  /** img srcset urls */
  srcset?: string
}

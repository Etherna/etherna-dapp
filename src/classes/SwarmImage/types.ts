import { Canceler } from "axios"

export type SwarmImageRaw = {
  /**  Resource type */
  "@type": "image" | "responsiveImage"
  /**  hash/<path?> of the original image */
  value: string
  /** Blurred & Low resolution base64 of the original image  */
  blurredBase64?: string
  /**  Responsive sources */
  sources?: {
    original: string
    [size: string]: string
  }
}

export type SwarmImageUploadOptions = {
  reference?: string
  path?: string
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}

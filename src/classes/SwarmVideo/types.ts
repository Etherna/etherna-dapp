import { IndexEncryptionType } from "@classes/EthernaIndexClient/types"
import SwarmImage from "@classes/SwarmImage"
import { SwarmImageRaw } from "@classes/SwarmImage/types"
import { Profile } from "@classes/SwarmProfile/types"
import { Canceler } from "axios"

export type SwarmVideoRaw = {
  /**  Title of the video */
  title: string
  /**  Description of the video */
  description: string
  /**  Quality of the original video */
  originalQuality: string
  /**  Address of the owner of the video */
  ownerAddress: string
  /**  Duration of the video in seconds */
  duration: number
  /** Thumbnail raw image */
  thumbnail?: SwarmImageRaw
  /**  List of available qualities of the video */
  sources: SwarmVideoSourceRaw[]
}

export type SwarmVideoMeta = {
  /**  Hash of the video */
  hash: string
  /**  Title of the video */
  title?: string
  /**  Description of the video */
  description?: string
  /**  Quality of the original video */
  originalQuality?: string
  /**  Address of the owner of the video */
  ownerAddress?: string
  /**  Duration of the video in seconds */
  duration: number
  /**  Url of the original video */
  source: string
  /**  Thumbnail image data */
  thumbnail?: SwarmImage
  /**  All qualities of video */
  sources: VideoSource[]
}

export type Video = SwarmVideoMeta & {
  /** Whether the video is indexed */
  isVideoOnIndex: boolean
  /** When the video was created */
  creationDateTime?: string
  /** Video encryption key */
  encryptionKey?: string
  /** Video encryption type */
  encryptionType?: IndexEncryptionType

  /** Owner info */
  owner?: {
    /** Owner ETH address */
    ownerAddress?: string
    /** Owner manifest hash of the profile */
    ownerIdentityManifest?: string
    /** Profile data of the owner */
    profileData?: Profile
  }
}

export type SwarmVideoSourceRaw = {
  quality: string
  path: string
  size?: number
  bitrate?: number
  contentType?: string
}

export type VideoSource = SwarmVideoSourceRaw & {
  /**  Source url */
  source: string
}


// Class options

export type SwarmVideoDownloadOptions = {
  /** If true will download the video even with prefetched data (default = false) */
  forced?: boolean
  /** By default true, set to false to avoid fetchsing the profile */
  fetchProfile?: boolean
}

export type SwarmVideoUploadOptions = {
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}

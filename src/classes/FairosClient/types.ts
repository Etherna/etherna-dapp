import { Canceler } from "axios"

export type FairosClientOptions = {
  host: string
  apiPath?: string
}

export type FairosPodsLS = {
  pod_name: string[]
  shared_pod_name: string[]
}

export type FairosEntryFile = {
  content_type: string
  access_time: string
  creation_time: string
  modification_time: string
  name: string
  size: string
  block_size: string
}

export type FairosEntryDir = {
  content_type: "inode/directory"
} & Omit<FairosEntryFile, "size" | "block_size">

export type FairosEntry = FairosEntryFile | FairosEntryDir

export type FairosDir = {
  entries: FairosEntry[]
}

export type FairosUploadOptions = {
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}

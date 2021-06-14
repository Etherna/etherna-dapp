export type IndexClientOptions = {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export type IndexUser = {
  address: string
  creationDateTime: string
  identityManifest: string
}

export type IndexCurrentUser = {
  address: string
  identityManifest: string
  prevAddresses: string[]
}

export type IndexUserVideos = IndexUser & {
  videos: IndexVideo[]
}

export type IndexVideo = {
  creationDateTime: string
  encryptionKey: string
  encryptionType: IndexEncryptionType
  manifestHash: string
  ownerAddress: string
  ownerIdentityManifest: string
  totDownvotes: number
  totUpvotes: number
}

export type IndexVideoComment = {
  creationDateTime: string
  ownerAddress: string
  ownerIdentityManifest?: string
  text: string
  videoManifestHash: string
}

export type VoteValue = "Up" | "Down" | "Neutral"

export type IndexEncryptionType = "AES256" | "Plain"

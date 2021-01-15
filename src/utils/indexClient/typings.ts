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
}

export type IndexEncryptionType = "AES256" | "Plain"

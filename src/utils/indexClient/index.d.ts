export interface IndexClientOptions {
  host: string
  apiPath?: string
  loginPath?: string
}

export interface IndexUser {
  address: string
  creationDateTime: string
  identityManifest: string
}

export interface IndexCurrentUser {
  address: string
  identityManifest: string
  prevAddresses: string[]
}

export interface IndexUserVideos extends IndexUser {
  videos: IndexVideo[]
}

export interface IndexVideo {
  creationDateTime: string
  encryptionKey: string
  encryptionType: string
  manifestHash: string
  ownerAddress: string
  ownerIdentityManifest: string
}

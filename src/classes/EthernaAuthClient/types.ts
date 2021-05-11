export type AuthClientOptions = {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export type AuthIdentity = {
  email: string | null
  etherAddress: string
  etherManagedPrivateKey: string | null
  etherPreviousAddresses: string[]
  etherLoginAddress: string | null
  phoneNumber: string | null
  username: string
}

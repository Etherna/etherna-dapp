export type GatewayClientOptions = {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export type GatewayCurrentUser = {
  etherAddress: string
  etherPreviousAddresses: string[]
  username: string
}

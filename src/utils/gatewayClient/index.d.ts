export interface GatewayClientOptions {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export interface GatewayCurrentUser {
  etherAddress: string
  etherPreviousAddresses: string[]
  username: string
}

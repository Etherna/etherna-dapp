export interface GatewayClientOptions {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export interface GatewayCurrentUser {
  address: string
}

export interface GatewayTransaction {
  ammount: number
  author: string
  creationDateTime: string
  operationName: string
}

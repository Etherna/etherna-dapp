type ExternalProvider = {
  isMetaMask?: boolean
  autoRefreshOnNetworkChange?: boolean
  chainId?: string
  networkVersion?: string
  selectedAddress?: string
  isConnected?(): Promise<boolean>
  enable?(): Promise<string[]>
  sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  request?: (request: { method: string, params?: Array<any> }) => Promise<any>
}

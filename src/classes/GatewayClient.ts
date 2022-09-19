import type { GatewayClientOptions } from "@etherna/api-js/clients"
import { EthernaGatewayClient } from "@etherna/api-js/clients"
import { isSafeURL, urlOrigin } from "@etherna/api-js/utils"

import { parseLocalStorage } from "@/utils/local-storage"

export default class GatewayClient extends EthernaGatewayClient {
  constructor(host: string, opts?: Omit<GatewayClientOptions, "url">) {
    super({
      url: host,
      apiPath: GatewayClient.apiPath,
      loginPath: opts?.loginPath,
      logoutPath: opts?.logoutPath,
    })
  }

  static get apiPath(): string {
    return `/api/v${import.meta.env.VITE_APP_API_VERSION}`
  }

  static get defaultHost(): string {
    const localUrl = parseLocalStorage<string>("setting:index-url")
    if (isSafeURL(localUrl)) {
      return urlOrigin(localUrl!)!
    }
    return urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)!
  }
}

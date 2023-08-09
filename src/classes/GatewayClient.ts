import { EthernaGatewayClient } from "@etherna/api-js/clients"
import { isSafeURL, urlOrigin } from "@etherna/api-js/utils"

import extensionsStore from "@/stores/extensions"

import type { GatewayClientOptions } from "@etherna/api-js/clients"

export default class GatewayClient extends EthernaGatewayClient {
  constructor(host: string, opts?: Omit<GatewayClientOptions, "url">) {
    super({
      url: host,
      apiPath: GatewayClient.apiPath,
      loginPath: opts?.loginPath,
      logoutPath: opts?.logoutPath,
    })
  }

  static fromExtensions(): GatewayClient {
    return new GatewayClient(GatewayClient.defaultUrl())
  }

  static defaultUrl(): string {
    const currentGatewayUrl = extensionsStore.getState().currentGatewayUrl
    return urlOrigin(
      isSafeURL(currentGatewayUrl) ? currentGatewayUrl : import.meta.env.VITE_APP_GATEWAY_URL
    )!
  }

  static get apiPath(): string {
    return `/api/v${import.meta.env.VITE_APP_API_VERSION}`
  }
}

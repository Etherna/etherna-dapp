import type { SSOClientOptions } from "@etherna/api-js/clients"
import { EthernaSSOClient } from "@etherna/api-js/clients"
import { isSafeURL, urlOrigin } from "@etherna/api-js/utils"

import { parseLocalStorage } from "@/utils/local-storage"

export default class SSOClient extends EthernaSSOClient {
  constructor(host: string, opts?: Omit<SSOClientOptions, "url">) {
    super({
      url: host,
      apiPath: SSOClient.apiPath,
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
    return urlOrigin(import.meta.env.VITE_APP_SSO_URL)!
  }
}

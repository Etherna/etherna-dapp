import type { IndexClientOptions } from "@etherna/api-js/clients"
import { EthernaIndexClient } from "@etherna/api-js/clients"
import { isSafeURL, urlOrigin } from "@etherna/api-js/utils"

import { parseLocalStorage } from "@/utils/local-storage"

export default class IndexClient extends EthernaIndexClient {
  constructor(host: string, opts?: Omit<IndexClientOptions, "url">) {
    super({
      url: host,
      apiPath: IndexClient.apiPath,
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
    return urlOrigin(import.meta.env.VITE_APP_INDEX_URL)!
  }
}

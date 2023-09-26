import { EthernaIndexClient } from "@etherna/sdk-js/clients"
import { isSafeURL, urlOrigin } from "@etherna/sdk-js/utils"

import extensionsStore from "@/stores/extensions"
import { getAccessToken } from "@/utils/jwt"

import type { IndexClientOptions } from "@etherna/sdk-js/clients"

export default class IndexClient extends EthernaIndexClient {
  constructor(host: string, opts?: Omit<IndexClientOptions, "url">) {
    super({
      url: host,
      apiPath: IndexClient.apiPath,
      accessToken: getAccessToken(),
      loginPath: opts?.loginPath,
      logoutPath: opts?.logoutPath,
    })
  }

  static fromExtensions(): IndexClient {
    return new IndexClient(IndexClient.defaultUrl())
  }

  static defaultUrl(): string {
    const currentIndexUrl = extensionsStore.getState().currentIndexUrl
    return urlOrigin(
      isSafeURL(currentIndexUrl) ? currentIndexUrl : import.meta.env.VITE_APP_INDEX_URL
    )!
  }

  static get apiPath(): string {
    return `/api/v${import.meta.env.VITE_APP_API_VERSION}`
  }
}

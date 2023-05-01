import { BeeClient as EthernaBeeClient } from "@etherna/api-js/clients"

import useExtensionsStore from "@/stores/extensions"
import { createRequest } from "@/utils/request"

import type { BeeClientOptions } from "@etherna/api-js/clients"

export default class BeeClient extends EthernaBeeClient {
  constructor(url: string, options?: BeeClientOptions) {
    const extensions = useExtensionsStore.getState().gatewaysList
    const extension = extensions.find(e => e.url === url)
    const includeCredentials = extension?.type !== "bee"
    super(url, {
      ...options,
      axios: createRequest({
        withCredentials: includeCredentials,
        baseURL: url,
      }),
    })
  }
}

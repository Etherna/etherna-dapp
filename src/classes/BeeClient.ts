import { BeeClient as EthernaBeeClient } from "@etherna/sdk-js/clients"

import useExtensionsStore from "@/stores/extensions"
import { getAccessToken } from "@/utils/jwt"
import { createRequest } from "@/utils/request"

import type { BeeClientOptions } from "@etherna/sdk-js/clients"

export default class BeeClient extends EthernaBeeClient {
  constructor(url: string, options?: BeeClientOptions) {
    const extensions = useExtensionsStore.getState().gatewaysList
    const extension = extensions.find(e => e.url === url)
    const includeCredentials = extension?.type !== "bee"
    super(url, {
      ...options,
      axios: createRequest({
        headers: {
          Authorization: !includeCredentials ? `Bearer ${getAccessToken()}` : undefined,
        },
        withCredentials: includeCredentials,
        baseURL: url,
      }),
    })
  }
}

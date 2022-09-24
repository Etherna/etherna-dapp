import type { BeeClientOptions } from "@etherna/api-js/clients"
import { BeeClient as EthernaBeeClient } from "@etherna/api-js/clients"

import { createRequest } from "@/utils/request"

export default class BeeClient extends EthernaBeeClient {
  constructor(url: string, options?: BeeClientOptions) {
    super(url, {
      ...options,
      axios: createRequest({
        withCredentials: true,
        baseURL: url,
      }),
    })
  }
}

import { BeeClient as EthernaBeeClient } from "@etherna/api-js/clients"

import { getAccessToken } from "@/utils/jwt"
import { createRequest } from "@/utils/request"

import type { BeeClientOptions } from "@etherna/api-js/clients"

export default class BeeClient extends EthernaBeeClient {
  constructor(url: string, options?: BeeClientOptions) {
    super(url, {
      ...options,
      axios: createRequest({
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
        baseURL: url,
      }),
    })
  }
}

import type BeeClient from "."
import type { RequestOptions } from "./types"

const chainstateEndpoint = "/chainstate"

export default class ChainState {
  constructor(private instance: BeeClient) {}

  async getCurrentPrice(options?: RequestOptions): Promise<number> {
    const token = this.instance.auth.token

    const resp = await this.instance.request.get(chainstateEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      timeout: options?.timeout,
      signal: options?.signal,
    })
    return resp.data.currentPrice ?? 4
  }
}

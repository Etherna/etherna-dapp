import type BeeClient from "."
import type { ReferenceResponse, RequestOptions, RequestUploadOptions } from "./types"
import { wrapBytesWithHelpers } from "./utils/bytes"
import { extractUploadHeaders } from "./utils/headers"

const chunkEndpoint = "/chunks"

export default class Chunk {
  constructor(private instance: BeeClient) {}

  async download(hash: string, options?: RequestOptions) {
    const resp = await this.instance.request.get<ArrayBuffer>(`${chunkEndpoint}/${hash}`, {
      responseType: "arraybuffer",
      headers: options?.headers,
      timeout: options?.timeout,
      signal: options?.signal,
    })

    return wrapBytesWithHelpers(new Uint8Array(resp.data))
  }

  async upload(data: Uint8Array, options: RequestUploadOptions) {
    const resp = await this.instance.request.post<ReferenceResponse>(`${chunkEndpoint}`, data, {
      headers: {
        "content-type": "application/octet-stream",
        ...extractUploadHeaders(options),
      },
      timeout: options?.timeout,
      signal: options?.signal,
    })

    return {
      reference: resp.data.reference,
    }
  }
}

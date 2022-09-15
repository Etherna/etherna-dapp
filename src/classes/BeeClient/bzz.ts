import type BeeClient from "."
import type { FileDownloadOptions, FileUploadOptions, ReferenceResponse } from "./types"
import { wrapBytesWithHelpers } from "./utils/bytes"
import { extractFileUploadHeaders, readFileHeaders } from "./utils/headers"

const bzzEndpoint = "/bzz"

type File = ReturnType<typeof readFileHeaders> & {
  data: ReturnType<typeof wrapBytesWithHelpers>
}

export default class Bzz {
  constructor(private instance: BeeClient) {}

  url(reference: string, path = "") {
    const safeReference = reference.replace(/(^\/|\/$)/g, "")
    const safePath = path.replace(/(^\/|\/$)/g, "")
    return `${this.url}${bzzEndpoint}/${safeReference}/${safePath}`.replace(/\/$/, "/")
  }

  async download(hash: string, options?: FileDownloadOptions): Promise<File> {
    return await this.downloadPath(hash, "", options)
  }

  async downloadPath(hash: string, path = "", options?: FileDownloadOptions): Promise<File> {
    const abortController = new AbortController()
    const signal = abortController.signal
    if (options?.signal) {
      options.signal.onabort = () => abortController.abort()
    }

    const resp = await this.instance.request.get<ArrayBuffer>(
      `${bzzEndpoint}/${hash}/${path.replace(/^\//, "")}`,
      {
        responseType: "arraybuffer",
        headers: options?.headers,
        timeout: options?.timeout,
        signal: signal,
        onDownloadProgress: e => {
          if (options?.onDownloadProgress) {
            const progress = Math.round(e.loaded / e.total)
            options.onDownloadProgress(progress)
          }
          if (options?.maxResponseSize && e.loaded > options.maxResponseSize) {
            abortController.abort("Response size exceeded")
          }
        },
      }
    )

    const file = {
      ...readFileHeaders(resp.headers),
      data: wrapBytesWithHelpers(new Uint8Array(resp.data)),
    }

    return file
  }

  async upload(data: Uint8Array | string, options: FileUploadOptions) {
    const resp = await this.instance.request.post<ReferenceResponse>(`${bzzEndpoint}`, data, {
      headers: {
        ...extractFileUploadHeaders(options),
      },
      timeout: options?.timeout,
      signal: options?.signal,
      onUploadProgress: e => {
        if (options?.onUploadProgress) {
          const progress = Math.round(e.loaded / e.total)
          options.onUploadProgress(progress)
        }
      },
    })

    return {
      reference: resp.data.reference,
      tagUid: resp.headers["swarm-tag"],
    }
  }
}

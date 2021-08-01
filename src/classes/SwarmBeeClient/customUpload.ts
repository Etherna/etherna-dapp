import { BatchId, Collection, UploadHeaders, UploadOptions } from "@ethersphere/bee-js"
import { prepareData } from "@ethersphere/bee-js/dist/src/utils/data"
import { makeTar } from "@ethersphere/bee-js/dist/src/utils/tar"
import { extractUploadHeaders } from "@ethersphere/bee-js/dist/src/utils/headers"

import http from "@utils/request"

export interface CustomUploadOptions extends UploadOptions {
  reference?: string
  endpoint?: "files" | "dirs"
  defaultIndexPath?: string
  defaultErrorPath?: string
}

export interface CustomUploadHeaders extends UploadHeaders {
  "swarm-index-document"?: string
  "swarm-error-document"?: string
}

/**
 * Extend the default header extractor with custom headers
 * @param opts Custom upload options
 * @returns The custom headers
 */
export function extractCustomUploadHeaders(postageBatchId: BatchId, opts?: CustomUploadOptions) {
  const headers: CustomUploadHeaders = extractUploadHeaders(postageBatchId, opts)

  if (opts?.defaultIndexPath) headers["swarm-index-document"] = opts.defaultIndexPath

  if (opts?.defaultErrorPath) headers["swarm-error-document"] = opts.defaultErrorPath

  return headers
}

/**
 * Upload single file to a Bee node
 *
 * @param postageBatchId  Postage batch id
 * @param url             Bee URL
 * @param data            Data to be uploaded
 * @param name            optional - name of the file
 * @param options         optional - Aditional options like tag, encryption, pinning
 */
export async function upload(
  postageBatchId: BatchId,
  url: string,
  data: string | Uint8Array | ArrayBuffer | Collection<Uint8Array>,
  options?: CustomUploadOptions,
): Promise<string> {
  const endpoint = "/" + (options?.endpoint ?? "files").replaceAll(/(^\/|\/$)/ig, "")
  const reference = options?.reference ? "/" + (options?.reference ?? "").replaceAll(/(^\/|\/$)/ig, "") : undefined

  const contentType = options?.endpoint === "dirs" ? "application/x-tar" : "application/octet-stream"
  const parsedData = options?.endpoint === "dirs"
    ? makeTar(data as Collection<Uint8Array>)
    : prepareData(data as string | Uint8Array | ArrayBuffer)

  const response = await http.request<{ reference: string }>({
    method: "post",
    url: `${url}${endpoint}${reference}`,
    data: parsedData,
    headers: {
      "content-type": contentType,
      ...extractCustomUploadHeaders(postageBatchId, options),
    },
    responseType: "json",
    ...options?.axiosOptions,
  })

  return response.data.reference
}

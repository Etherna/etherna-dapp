/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { CancelToken } from "axios"
import { BatchId, Collection, UploadHeaders, UploadOptions } from "@ethersphere/bee-js"
import { prepareData } from "@ethersphere/bee-js/dist/src/utils/data"
import { makeTar } from "@ethersphere/bee-js/dist/src/utils/tar"
import { extractUploadHeaders } from "@ethersphere/bee-js/dist/src/utils/headers"

import http from "@utils/request"

export interface CustomUploadOptions extends UploadOptions, AxiosUploadOptions {
  reference?: string
  endpoint?: "files" | "dirs"
  defaultIndexPath?: string
  defaultErrorPath?: string
}

export interface AxiosUploadOptions {
  onUploadProgress?: (progressEvent: { loaded: number, total: number }) => void
  cancelToken?: CancelToken
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
    onUploadProgress: options?.onUploadProgress,
    cancelToken: options?.cancelToken,
  })

  return response.data.reference
}

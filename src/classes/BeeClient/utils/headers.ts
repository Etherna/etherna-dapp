import type { AxiosResponseHeaders } from "axios"

import type { FileUploadOptions, RequestUploadOptions } from "../types"

export function readFileHeaders(headers: AxiosResponseHeaders) {
  const name = readContentDispositionFilename(headers["content-disposition"])
  const tagUid = readTagUid(headers["swarm-tag-uid"])
  const contentType = headers["content-type"] || undefined

  return {
    name,
    tagUid,
    contentType,
  }
}

export function extractUploadHeaders(options: RequestUploadOptions): Record<string, string> {
  if (!options.batchId) {
    throw new Error("Postage BatchID has to be specified!")
  }

  const headers: Record<string, string> = {
    ...options.headers,
    "swarm-postage-batch-id": options.batchId,
  }

  if (options?.pin) headers["swarm-pin"] = String(options.pin)

  if (options?.encrypt) headers["swarm-encrypt"] = String(options.encrypt)

  if (options?.tag) headers["swarm-tag"] = String(options.tag)

  if (typeof options?.deferred === "boolean")
    headers["swarm-deferred-upload"] = String(options.deferred)

  return headers
}

export function extractFileUploadHeaders(options: FileUploadOptions): Record<string, string> {
  const headers = extractUploadHeaders(options)

  if (options?.size) headers["content-length"] = String(options.size)

  if (options?.contentType) headers["content-type"] = options.contentType

  return headers
}

function readContentDispositionFilename(header: string | undefined): string {
  if (!header) {
    throw new Error("missing content-disposition header")
  }

  const dispositionMatch = header.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i)

  if (dispositionMatch && dispositionMatch.length > 0) {
    return dispositionMatch[1]!
  }
  throw new Error("invalid content-disposition header")
}

function readTagUid(header: string | undefined): number | undefined {
  if (!header) {
    return undefined
  }

  return parseInt(header, 10)
}

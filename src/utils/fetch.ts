/// Credit: https://github.com/lifeomic/axios-fetch

import { AxiosInstance, AxiosRequestConfig, Method } from "axios"

type AxiosFetch = (input: string | Request, init?: RequestInit) => Promise<Response>

const isRequestInput = (input: string | Request): input is Request => {
  return typeof input === "object"
}

const isArrayHeaders = (headers: HeadersInit | undefined): headers is string[][] => {
  return Array.isArray(headers)
}

const isIteratorHeaders = (headers: HeadersInit | undefined): headers is Headers => {
  return !isArrayHeaders(headers) && typeof headers === "object" && "entries" in headers
}

const isObjectHeaders = (headers: HeadersInit | undefined): headers is Record<string, string> => {
  return !isIteratorHeaders(headers) && typeof headers === "object"
}

const readAllChunks = async (readableStream: ReadableStream): Promise<Uint8Array> => {
  const reader = readableStream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { value, done } = await reader.read()

    value && chunks.push(value)

    if (done) break
  }

  const mergedArray = new Uint8Array(chunks.reduce((length, chunk) => length + chunk.length, 0))
  let position = 0
  for (const chunk of chunks) {
    mergedArray.set(chunk, position)
    position += chunk.length
  }

  return mergedArray
}

const mapHeaders = (headers: HeadersInit | undefined) => {
  const entries = isArrayHeaders(headers)
    ? headers
    : isIteratorHeaders(headers)
      ? Array.from(headers)
      : isObjectHeaders(headers)
        ? Object.entries(headers)
        : []
  const lowerCasedHeaders = entries.reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value
    return acc
  }, {})

  if (!("content-type" in lowerCasedHeaders)) {
    lowerCasedHeaders["content-type"] = "text/plain;charset=UTF-8"
  }

  return lowerCasedHeaders
}

export const buildAxiosFetch = (axios: AxiosInstance): AxiosFetch => {
  return async (input, init = {}) => {
    const isRequest = isRequestInput(input)
    const inputHeaders = isRequest ? input.headers : init.headers
    const lowerCasedHeaders = mapHeaders(inputHeaders)
    const url = isRequest ? input?.url : input
    const method = (isRequest ? input?.method ?? "GET" : input) as Method
    let data: any = isRequest ? input.body : init.body

    if (data instanceof ReadableStream) {
      data = await readAllChunks(data)
      data = new Blob([data], { type: "video/mp4" })
    }

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      headers: lowerCasedHeaders,
      withCredentials: init.credentials === "include",
      responseType: "arraybuffer"
    }

    let result
    try {
      result = await axios.request(config)
    } catch (err: any) {
      if (err.response) {
        result = err.response
      } else {
        throw err
      }
    }

    return new Response(result.data, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers
    })
  }
}

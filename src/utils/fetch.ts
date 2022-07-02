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

/// Credit: https://github.com/lifeomic/axios-fetch

import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from "axios"

export type AxiosFetch = (input: string | Request, init?: RequestInit) => Promise<Response>

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
    const method = (isRequest ? input?.method ?? "GET" : init.method ?? "GET").toUpperCase() as Method
    let data: any = isRequest ? input.body : init.body

    if (data instanceof ReadableStream) {
      data = await readAllChunks(data)
      data = new Blob([data])
    }
    if (!data && isRequest && method !== "GET" && method !== "HEAD") {
      data = await input.blob()
    }

    const withCredentials = init.credentials === "include" ||
      axios.defaults.withCredentials

    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      headers: lowerCasedHeaders,
      withCredentials,
      responseType: "arraybuffer"
    }

    let result: AxiosResponse
    try {
      result = await axios.request(config)
    } catch (err: any) {
      const error = err as AxiosError

      if (error.response?.data) {
        result = error.response
      } else {
        throw error
      }
    }

    return new Response(result.data, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers
    })
  }
}

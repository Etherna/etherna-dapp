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

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios"
import axios from "axios"

interface SkipXHRError extends AxiosError {
  isSkipXHR?: boolean
  request?: AxiosRequestConfig
}

type AxiosPendingRequest = {
  /** Hash of the request config */
  hash: string
  /** Number of waiting requests */
  count: number
  /** Response of the first request */
  response?: AxiosResponse | SkipXHRError
}

type PendingCache = {
  /** Get the current pending axios requests */
  pendingRequests: AxiosPendingRequest[]
  /** Find the pending request related to an axios config */
  findPendingRequest: (config: AxiosRequestConfig | undefined) => AxiosPendingRequest | undefined
  /** Check if the same request has already been made, so it should wait for the first one instead */
  shouldThrottle: (config: AxiosRequestConfig) => boolean
  /** Promise waiting for the first request to finish */
  waitPendingRequest: (config: AxiosRequestConfig) => Promise<unknown>
  /** Create a pending request or increase the counter for an existing one */
  pushPendingRequest: (config: AxiosRequestConfig) => void
  /** Decrease pending request counter and delete it if empty */
  popPendingRequest: (config: AxiosRequestConfig | undefined) => void
}

const hashCode = (value: string) => {
  let hash = 0
  let i: number
  let chr: number
  if (value.length === 0) return hash.toString()
  for (i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash.toString()
}

/**
 * Convert a axios config to a sha3 hash
 * @param config Axios config object
 */
const configHash = (config: AxiosRequestConfig | null | undefined) => {
  return config
    ? hashCode(
        JSON.stringify({
          method: config.method,
          url: config.url,
          params: config.params,
          body: config.data || "",
        })
      )
    : ""
}

const AxiosPendingCache: PendingCache = {
  pendingRequests: [],

  findPendingRequest: config => {
    return AxiosPendingCache.pendingRequests.find(preq => preq.hash === configHash(config))
  },

  shouldThrottle: config => {
    return !!AxiosPendingCache.findPendingRequest(config)
  },

  waitPendingRequest: config => {
    return new Promise(resolve => {
      const checkResolve = () => {
        setTimeout(() => {
          const pendingRequest = AxiosPendingCache.findPendingRequest(config)
          if (!pendingRequest) {
            resolve(new Error("Coudn't find cached request"))
          } else if (pendingRequest.response !== undefined) {
            resolve(pendingRequest.response)
          } else {
            checkResolve()
          }
        }, 200)
      }
      checkResolve()
    })
  },

  pushPendingRequest: config => {
    let pendingRequest = AxiosPendingCache.findPendingRequest(config)
    if (pendingRequest) {
      pendingRequest.count += 1
    } else {
      AxiosPendingCache.pendingRequests.push({
        hash: configHash(config) || "",
        count: 0,
        response: undefined,
      })
    }
  },

  popPendingRequest: config => {
    const pendingIndex = AxiosPendingCache.pendingRequests.findIndex(
      preq => preq.hash === configHash(config)
    )

    if (pendingIndex === -1) return

    let pendingRequest = AxiosPendingCache.pendingRequests[pendingIndex]
    if (pendingRequest.count <= 1) {
      AxiosPendingCache.pendingRequests.splice(pendingIndex, 1)
    } else {
      pendingRequest.count -= 1
    }
  },
}

export const createRequest = () => {
  const request = axios.create()

  request.interceptors.request.use(
    async config => {
      if (!config) return config

      // only cache get requests
      if (!["GET", "get"].includes(config.method || "")) return config

      const shouldThrottle = AxiosPendingCache.shouldThrottle(config)

      AxiosPendingCache.pushPendingRequest(config)

      /**
       * Check in the pending requests if the same request
       * has already been called.
       */
      if (shouldThrottle) {
        // wait the first request to finish
        await AxiosPendingCache.waitPendingRequest(config)

        const skipXHRError = new Error("Skip request") as SkipXHRError
        skipXHRError.isSkipXHR = true
        skipXHRError.request = config
        throw skipXHRError
      }

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  request.interceptors.response.use(
    response => {
      // check if a pending request exists
      let pendingRequest = AxiosPendingCache.findPendingRequest(response.config)
      if (pendingRequest) {
        if (pendingRequest.count > 0) {
          pendingRequest.response = response
        } else {
          AxiosPendingCache.popPendingRequest(response.config)
        }
      }
      return response
    },
    async (error: SkipXHRError) => {
      if (error.isSkipXHR) {
        const firstRequest = AxiosPendingCache.findPendingRequest(error.request!)
        const response = firstRequest?.response
        if (response) {
          // clear pending request
          AxiosPendingCache.popPendingRequest(error.request!)

          // return response
          if (response instanceof Error) {
            return Promise.reject(response)
          } else {
            return Promise.resolve(response)
          }
        }

        return Promise.reject("Coudn't find cached request")
      } else {
        // This is an error thrown by the first/main request

        // check if the first request throwed
        let pendingRequest = AxiosPendingCache.findPendingRequest(error.config)

        if (pendingRequest) {
          if (pendingRequest.count > 0) {
            // has pending requests, so add response
            pendingRequest.response = error
          } else {
            // single request, remove from cache
            AxiosPendingCache.popPendingRequest(error.config)
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return request
}

export const getResponseErrorMessage = (error: AxiosError): string => {
  const response = error.response
  if (response) {
    const data = error.response?.data

    if (typeof data === "string") return data

    try {
      if (!data) throw "CODE"

      return JSON.stringify(data)
    } catch {
      switch (error.response?.status) {
        case 400:
          return "Bad request"
        case 401:
          return "Unauthorized"
        case 402:
          return "Insufficient Credit"
        case 403:
          return "Forbidden"
        case 404:
          return "Not found"
        default:
          return "Internal server error"
      }
    }
  } else {
    return error.message
  }
}

const request = createRequest()

export default request

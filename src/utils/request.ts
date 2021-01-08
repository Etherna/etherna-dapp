import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios"
import { sha3 } from "web3-utils"

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
  findPendingRequest: (config: AxiosRequestConfig|undefined) => AxiosPendingRequest | undefined
  /** Check if the same request has already been made, so it should wait for the first one instead */
  shouldThrottle: (config: AxiosRequestConfig) => boolean
  /** Promise waiting for the first request to finish */
  waitPendingRequest: (config: AxiosRequestConfig) => Promise<unknown>
  /** Create a pending request or increase the counter for an existing one */
  pushPendingRequest: (config: AxiosRequestConfig) => void
  /** Decrease pending request counter and delete it if empty */
  popPendingRequest: (config: AxiosRequestConfig|undefined) => void
}

/**
 * Convert a axios config to a sha3 hash
 * @param config Axios config object
 */
const configHash = (config: AxiosRequestConfig|null|undefined) => {
  return config
    ? sha3(
      JSON.stringify({
        method: config.method,
        url: config.url,
        params: config.params,
        body: config.data || "",
      })
    ) : ""
}

const AxiosPendingCache: PendingCache = {
  pendingRequests: [],

  findPendingRequest: config => {
    return AxiosPendingCache.pendingRequests.find(
      preq => preq.hash === configHash(config)
    )
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

const request = axios.create()

request.interceptors.request.use(
  async config => {
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
      } else {
        return Promise.reject("Coudn't find cached request")
      }
    } else {
      // check if the first request throwed
      let pendingRequest = AxiosPendingCache.findPendingRequest(error.response?.config)
      if (pendingRequest) {
        if (pendingRequest.count > 0) {
          pendingRequest.response = error
        } else {
          AxiosPendingCache.popPendingRequest(error.response?.config)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default request

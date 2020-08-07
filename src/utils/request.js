import axios from "axios"
import { sha3 } from "web3-utils"

const AxiosPendingCache = {
    /**
     * Get the current pending axios requests
     * @typedef {object} AxiosPendingRequest
     * @property {string} hash Hash of the request config
     * @property {number} count Number of waiting requests
     * @property {import("axios").AxiosResponse<any>} response Response of the first request
     * @var {AxiosPendingRequest[]}
     */
    pendingRequests: [],

    /**
     * Convert a axios config to a sha3 hash
     * @param {import("axios").AxiosRequestConfig} config Axios config object
     * @return {string}
     */
    configHash: config => {
        return sha3(JSON.stringify({
            method: config.method,
            url: config.url,
            params: config.params,
            body: config.data || "",
        }))
    },

    /**
     * Find the pending request related to an axios config
     * @param {import("axios").AxiosRequestConfig} config Axios config
     * @returns {AxiosPendingRequest|null} Pending request
     */
    findPendingRequest: config => {
        return AxiosPendingCache.pendingRequests
            .find(preq => preq.hash === AxiosPendingCache.configHash(config))
    },

    /**
     * Check if the same request has already been
     * made, so it should wait for the first one instead
     * @param {import("axios").AxiosRequestConfig} config Axios config
     * @returns {boolean} Whether it should throttle
     */
    shouldThrottle: config => {
        return !!AxiosPendingCache.findPendingRequest(config)
    },

    /**
     * Promise waiting for the first request to finish
     * @param {import("axios").AxiosRequestConfig} config Axios config
     * @returns {Promise<any>} Whether it should throttle
     */
    waitPendingRequest: config => new Promise(resolve => {
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
    }),

    /**
     * Create a pending request or increase the counter for an existing one
     * @param {import("axios").AxiosRequestConfig} config Axios config
     */
    pushPendingRequest: config => {
        let pendingRequest = AxiosPendingCache.findPendingRequest(config)
        if (pendingRequest) {
            pendingRequest.count += 1
        } else {
            AxiosPendingCache.pendingRequests.push({
                hash: AxiosPendingCache.configHash(config),
                count: 0,
                response: undefined
            })
        }
    },

    /**
     * Decrease pending request counter and delete it if empty
     * @param {import("axios").AxiosRequestConfig} config Axios config
     */
    popPendingRequest: config => {
        const pendingIndex = AxiosPendingCache.pendingRequests
            .findIndex(preq => preq.hash === AxiosPendingCache.configHash(config))

        if (pendingIndex === -1) return

        let pendingRequest = AxiosPendingCache.pendingRequests[pendingIndex]
        if (pendingRequest.count <= 1) {
            AxiosPendingCache.pendingRequests.splice(pendingIndex, 1)
        } else {
            pendingRequest.count -= 1
        }
    }
}

const request = axios.create()

request.interceptors.request.use(async config => {
    // only cache get requests
    if (!["GET", "get"].includes(config.method)) return config

    const shouldThrottle = AxiosPendingCache.shouldThrottle(config)

    AxiosPendingCache.pushPendingRequest(config)

    /**
     * Check in the pending requests if the same request
     * has already been called.
     */
    if (shouldThrottle) {
        // wait the first request to finish
        await AxiosPendingCache.waitPendingRequest(config)

        const skipXHRError = new Error("Skip request")
        skipXHRError.isSkipXHR = true
        skipXHRError.request = config
        throw skipXHRError
    }

    return config
}, error => {
    return Promise.reject(error)
})

request.interceptors.response.use(response => {
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
}, async error => {
    if (error.isSkipXHR) {
        const firstRequest = AxiosPendingCache.findPendingRequest(error.request)
        const response = firstRequest && firstRequest.response
        if (response) {
            // clear pending request
            AxiosPendingCache.popPendingRequest(error.request)

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
        let pendingRequest = AxiosPendingCache.findPendingRequest(error.response.config)
        if (pendingRequest) {
            if (pendingRequest.count > 0) {
                pendingRequest.response = error
            } else {
                AxiosPendingCache.popPendingRequest(error.response.config)
            }
        }
    }

    return Promise.reject(error)
})

export default request
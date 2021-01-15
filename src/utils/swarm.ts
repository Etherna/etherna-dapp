import Axios, { AxiosError, Canceler } from "axios"
import isArray from "lodash/isArray"

import { store } from "@state/store"
import http from "@utils/request"

export type SwarmObject = {
  hash: string
  url: string
}

/**
 * Get the Swarm url of an image or resource
 * @param image Image object definition or hash string value
 * @param raw Is the resource raw (default = false)
 */
export const getResourceUrl = (image: SwarmObject|string, raw = false) => {
  const SwarmGateway = store.getState().env.gatewayHost
  const protocol = raw ? "bzz-raw:" : "bzz:"

  if (typeof image === "string") {
    return `${SwarmGateway}/${protocol}/${image}`
  }

  if (image && typeof image === "object") {
    if (image.hash) {
      return `${SwarmGateway}/${protocol}/${image.hash}`
    }
    if (image.url) {
      return image.url
    }
  }

  return undefined
}

/**
 * Upload a file to swarm
 * @param file File to upload
 * @returns Hash of the uplaoded file
 */
export const uploadResourceToSwarm = async (file: File) => {
  const SwarmGateway = store.getState().env.gatewayHost
  const endpoint = `${SwarmGateway}/bzz:/`

  const buffer = typeof file === "string"
    ? new TextEncoder().encode(file)
    : await fileReaderPromise(file)
  const formData = new Blob([new Uint8Array(buffer)])

  const resp = await http.post<string>(endpoint, formData)
  const hash = resp.data

  if (isValidHash(hash)) {
    return hash
  } else {
    throw new Error("Invalid hash returned")
  }
}

/**
 * Update content on swarm
 * @param manifest Current manifest hash to update (use null to crete a new one)
 * @param path File path (empty for defaultPath)
 * @param buffer Buffer of the data to upload
 * @param type Mime type (eg: video/mp4)
 * @param options Upload options
 * @returns The file manifest
 */
export const uploadManifestData = async (
  manifest: string|undefined,
  path: string|undefined,
  buffer: ArrayBuffer,
  type: string,
  options: {
    pinContent: boolean
    progressCallback?: (p: number) => void
    cancelTokenCallback?: (c: Canceler) => void
  } = { pinContent: true }
) => {
  const { gatewayHost } = store.getState().env
  const endpoint = `${gatewayHost}/bzz:/${manifest ? `${manifest}/` : ``}`

  const data = new FormData()
  data.append(path || "", new Blob([buffer], { type }), path || "")

  const resp = await http.post<string>(endpoint, data, {
    headers: {
      "x-swarm-pin": `${options.pinContent}`,
      "content-type": "multipart/form-data",
    },
    onUploadProgress: pev => {
      const progress = Math.round((pev.loaded * 100) / pev.total)
      options.progressCallback && options.progressCallback(progress)
    },
    cancelToken: new Axios.CancelToken(function executor(c) {
      options.cancelTokenCallback && options.cancelTokenCallback(c)
    }),
  })

  return resp.data
}

/**
 * Check if pinning is available on the current gateway
 * @returns {boolean}
 */
export const isPinningEnabled = async () => {
  const SwarmGateway = store.getState().env.gatewayHost
  const endpoint = `${SwarmGateway}/bzz-pin:/`
  try {
    await http.get(endpoint)
    return true
  } catch (error) {
    console.error(error)

    const axiosError = error as AxiosError

    if (
      axiosError.response?.data &&
      "Msg" in axiosError.response.data &&
      axiosError.response.data.Msg === "Pinning disabled on this node"
    ) {
      return false
    }
    if (axiosError.response?.status === 403) {
      return false
    }
  }

  throw new Error(
    "Request for pinning has failed. Check if the gateway is secured with a SSL certificate."
  )
}

/**
 * Check if a resource is pinned on the current gateway.
 * @param hashList Swarm file hash or array of hashes
 */
export const isPinned = async (hashList: string|string[]) => {
  const SwarmGateway = store.getState().env.gatewayHost
  const endpoint = `${SwarmGateway}/bzz-pin:/`
  const hashes = isArray(hashList) ? hashList : [hashList]

  try {
    const resp = await http.get(endpoint)
    const pins = isArray(resp.data)
      ? resp.data.filter(pin => hashes.indexOf(pin.Address) >= 0)
      : []

    let allPinned = true
    hashes.forEach(hash => {
      if (pins.findIndex(pin => pin.Address === hash) === -1) {
        allPinned = false
      }
    })

    return allPinned
  } catch {
    return false
  }
}

/**
 * Pin a content after the upload on the current gateway.
 * @param hash Swarm file hash
 * @param raw The hash is raw content (default = false)
 */
export const pinResource = async (hash: string, raw = false) => {
  const SwarmGateway = store.getState().env.gatewayHost
  const endpoint = `${SwarmGateway}/bzz-pin:/${hash}`

  try {
    await http.post(endpoint, null, {
      params: {
        raw: raw ? "true" : null,
      },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Unpin a content after the upload on the current gateway.
 * @param hash Swarm file hash
 */
export const unpinResource = async (hash: string) => {
  const SwarmGateway = store.getState().env.gatewayHost
  const endpoint = `${SwarmGateway}/bzz-pin:/${hash}`

  try {
    await http.delete(endpoint)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a resource is raw
 * @param hash Resource hash
 */
export const isRaw = async (hash: string) => {
  try {
    const SwarmGateway = store.getState().env.gatewayHost
    const url = `${SwarmGateway}/bzz-list:/${hash}`
    await http.get(url)
    return false
  } catch (error) {
    return true
  }
}

/**
 * Check if a hash is a valid Swarm hash
 * @param hash Hash of the resource
 */
export const isValidHash = (hash: string) => {
  return /^[0-9a-f]{64}$/.test(hash)
}

/**
 * Get the array buffer of a file
 * @param file File to convert
 */
export const fileReaderPromise = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    let fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer)
    }
    fr.onabort = reject
    fr.onerror = reject
    fr.readAsArrayBuffer(file)
  })
}

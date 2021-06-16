import Axios from "axios"
import qs from "querystring"

import { writePath } from "@utils/fairdrive"
import http from "@utils/request"
import { FairosUploadOptions } from "./types"

export default class IndexUsersClient {
  url: string

  /**
   * Init an fairos file client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Upload a file to fair drive
   * @param file File blob to upload
   * @param directory Directory to upload in
   * @param opts Upload options
   * @returns The uploaded files
   */
  upload = async (file: Blob, directory: "root" | string, opts?: FairosUploadOptions) => {
    let writePath = ""
    if (directory === "root") {
      writePath = "/"
    } else {
      writePath = "/" + directory.replace(/&/g, "/");
    }

    const formData = new FormData()
    formData.append("files", file)
    formData.append("pod_dir", writePath)
    formData.append("block_size", "64Mb")

    const endpoint = `${this.url}/file/upload`
    const { data: uploadFiles } = await http.post(endpoint, formData, {
      withCredentials: true,
      onUploadProgress: e => {
        if (opts?.onUploadProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          opts.onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (opts?.onCancelToken) {
          opts.onCancelToken(c)
        }
      }),
    })

    return uploadFiles
  }

  /**
   * Download a file from fairdrive
   * @param path File path
   * @param filename File name
   * @param opts Download options
   * @returns The blob
   */
  download = async (path: string, filename: string, opts?: FairosUploadOptions) => {
    const file = (writePath(path) + filename).replace(/\/?$/, "")
    const endpoint = `${this.url}/file/download`
    const { data: blob } = await http.post(endpoint, qs.stringify({ file }), {
      withCredentials: true,
      responseType: "blob",
      onUploadProgress: e => {
        if (opts?.onUploadProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          opts.onUploadProgress(progress)
        }
      },
      cancelToken: new Axios.CancelToken(function executor(c) {
        if (opts?.onCancelToken) {
          opts.onCancelToken(c)
        }
      }),
    })

    return blob
  }
}

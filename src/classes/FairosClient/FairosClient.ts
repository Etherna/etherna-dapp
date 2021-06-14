import FairosFilesClient from "./FairosFilesClient"
import FairosUserClient from "./FairosUserClient"
import { FairosClientOptions } from "./types"

export default class FairosClient {
  files: FairosFilesClient
  user: FairosUserClient

  /**
   * Init an index client
   * @param options Client options
   */
  constructor(options: FairosClientOptions) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/(^\/?|\/?$)/g, "") : ""
    const url = `${host}/${apiPath}`

    this.files = new FairosFilesClient(url)
    this.user = new FairosUserClient(url)
  }

  static get defaultHost(): string {
    return window.localStorage.getItem("fairosHost") || import.meta.env.VITE_APP_FAIROS_HOST
  }

  static get defaultApiPath(): string {
    return window.localStorage.getItem("fairosApiPath") || import.meta.env.VITE_APP_FAIROS_API_PATH
  }
}

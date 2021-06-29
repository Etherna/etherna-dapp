import IndexVideosClient from "./IndexVideosClient"
import IndexUsersClient from "./IndexUsersClient"
import { IndexClientOptions } from "./types"
import { safeURL, urlOrigin } from "@utils/urls"

export default class EthernaIndexClient {
  videos: IndexVideosClient
  users: IndexUsersClient
  loginPath: string
  logoutPath: string

  /**
   * Init an index client
   * @param options Client options
   */
  constructor(options: IndexClientOptions) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/(^\/?|\/?$)/g, "") : ""
    const url = `${host}/${apiPath}`

    this.videos = new IndexVideosClient(url)
    this.users = new IndexUsersClient(url)
    this.loginPath = `${host}${options.loginPath || "/account/login"}`
    this.logoutPath = `${host}${options.logoutPath || "/account/logout"}`
  }

  /**
   * Redirect to login page
   * @param returnUrl Redirect url after login (default = null)
   */
  loginRedirect(returnUrl: string | null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.loginPath + `?ReturnUrl=${retUrl}`
  }

  /**
   * Redirect to logout page
   * @param returnUrl Redirect url after logout (default = null)
   */
  logoutRedirect(returnUrl: string | null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.logoutPath + `?ReturnUrl=${retUrl}`
  }

  static get defaultHost(): string {
    return window.localStorage.getItem("setting:index-url") || urlOrigin(import.meta.env.VITE_APP_INDEX_URL)!
  }

  static get defaultApiPath(): string {
    return window.localStorage.getItem("setting:index-url") || safeURL(import.meta.env.VITE_APP_INDEX_URL)!.pathname
  }
}

import { parseLocalStorage } from "@utils/localStorage"
import { safeURL, urlOrigin } from "@utils/urls"
import AuthIdentityClient from "./AuthIdentityClient"
import { AuthClientOptions } from "./types"

export default class EthernaAuthClient {
  identity: AuthIdentityClient
  loginPath: string
  logoutPath: string

  /**
   * Init an index client
   * @param options Client options
   */
  constructor(options: AuthClientOptions) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/(^\/?|\/?$)/g, "") : ""
    const url = `${host}/${apiPath}`

    this.identity = new AuthIdentityClient(url)
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
    return urlOrigin(parseLocalStorage("setting:auth-url") || import.meta.env.VITE_APP_AUTH_URL)!
  }

  static get defaultApiPath(): string {
    return safeURL(parseLocalStorage("setting:auth-url") || import.meta.env.VITE_APP_AUTH_URL)!.pathname
  }
}

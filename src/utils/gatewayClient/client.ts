import GatewayUsersClient from "./gatewayUsersClient"
import GatewaySettingsClient from "./gatewaySettingsClient"
import { GatewayClientOptions } from "./typings"

export default class GatewayClient {
  users: GatewayUsersClient
  settings: GatewaySettingsClient
  loginPath: string
  logoutPath: string

  /**
   * Init an gateway client
   * @param options Client options
   */
  constructor(options: GatewayClientOptions) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/(^\/?|\/?$)/g, "") : ""
    const url = `${host}/${apiPath}`

    this.users = new GatewayUsersClient(url)
    this.settings = new GatewaySettingsClient(url)
    this.loginPath = `${host}${options.loginPath || "/account/login"}`
    this.logoutPath = `${host}${options.logoutPath || "/account/logout"}`
  }

  /**
   * Redirect to login page
   * @param returnUrl Redirect url after login (default = null)
   */
  loginRedirect(returnUrl: string|null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.loginPath + `?ReturnUrl=${retUrl}`
  }

  /**
   * Redirect to logout page
   * @param returnUrl Redirect url after logout (default = null)
   */
  logoutRedirect(returnUrl: string|null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.logoutPath + `?ReturnUrl=${retUrl}`
  }
}

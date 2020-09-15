import GatewayUserClient from "./gatewayUserClient"

export default class GatewayClient {
  /**
   * Init an gateway client
   * @param {import(".").GatewayClientOptions} options Client options
   */
  constructor(options) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/(^\/?|\/?$)/g, "") : ""
    const url = `${host}/${apiPath}`

    this.user = new GatewayUserClient(url)
    this.loginPath = `${host}${options.loginPath || "/account/login"}`
    this.logoutPath = `${host}${options.logoutPath || "/account/logout"}`
  }

  loginRedirect() {
    window.location.href = this.loginPath + `?ReturnUrl=${window.location.href}`
  }

  logoutRedirect() {
    window.location.href = this.logoutPath + `?ReturnUrl=${window.location.href}`
  }
}

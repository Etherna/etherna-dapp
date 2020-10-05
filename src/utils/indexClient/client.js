import IndexVideosClient from "./indexVideosClient"
import IndexUsersClient from "./indexUsersClient"

export default class IndexClient {
  /**
   * Init an index client
   * @param {import(".").IndexClientOptions} options Client options
   */
  constructor(options) {
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
   * @param {string} returnUrl Redirect url after login (default = null)
   */
  loginRedirect(returnUrl = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.loginPath + `?ReturnUrl=${retUrl}`
  }

  /**
   * Redirect to logout page
   * @param {string} returnUrl Redirect url after logout (default = null)
   */
  logoutRedirect(returnUrl = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.logoutPath + `?ReturnUrl=${retUrl}`
  }
}

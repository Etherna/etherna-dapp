import IndexVideosClient from "./indexVideosClient"
import IndexUsersClient from "./indexUsersClient"

export default class IndexClient {
  /**
   * Init an index client
   * @param {import(".").IndexClientOptions} options Client options
   */
  constructor(options) {
    const host = options.host.replace(/\/?$/, "")
    const apiPath = options.apiPath ? options.apiPath.replace(/\/?$/, "") : ""
    const url = `${host}/${apiPath}`

    this.videos = new IndexVideosClient(url)
    this.users = new IndexUsersClient(url)
    this.loginPath = `${host}${options.loginPath || "/account/login"}`
  }

  loginRedirect() {
    window.location.href = this.loginPath + `?ReturnUrl=${window.location.href}`
  }
}

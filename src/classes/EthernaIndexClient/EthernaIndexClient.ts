/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import IndexVideosClient from "./IndexVideosClient"
import IndexUsersClient from "./IndexUsersClient"
import { IndexClientOptions } from "./types"

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

  static get defaultHost(): string {
    return window.localStorage.getItem("indexHost") || process.env.REACT_APP_INDEX_HOST
  }

  static get defaultApiPath(): string {
    return window.localStorage.getItem("indexApiPath") || process.env.REACT_APP_INDEX_API_PATH
  }
}

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

import GatewayPostageClient from "./GatewayPostageClient"
import GatewayResourcesClient from "./GatewayResourcesClient"
import GatewaySystemClient from "./GatewaySystemClient"
import GatewayUsersClient from "./GatewayUsersClient"
import type { GatewayClientOptions } from "@/definitions/api-gateway"
import { parseLocalStorage } from "@/utils/local-storage"
import { isSafeURL, safeURL, urlOrigin } from "@/utils/urls"

export default class EthernaGatewayClient {
  url: string
  resources: GatewayResourcesClient
  users: GatewayUsersClient
  system: GatewaySystemClient
  postage: GatewayPostageClient
  loginPath: string
  logoutPath: string

  static maxBatchDepth = 20

  /**
   * Init an gateway client
   *
   * @param options Client options
   */
  constructor(options: GatewayClientOptions) {
    this.url = options.host.replace(/\/?$/, "")

    const apiPath = `/api/v${import.meta.env.VITE_APP_API_VERSION}`
    const url = `${this.url}${apiPath}`

    this.resources = new GatewayResourcesClient(url, options.abortController)
    this.users = new GatewayUsersClient(url, options.abortController)
    this.system = new GatewaySystemClient(url, options.abortController)
    this.postage = new GatewayPostageClient(url, options.abortController)
    this.loginPath = `${this.url}${options.loginPath || "/account/login"}`
    this.logoutPath = `${this.url}${options.logoutPath || "/account/logout"}`
  }

  set abortController(value: AbortController) {
    this.resources.abortController = value
    this.users.abortController = value
    this.system.abortController = value
    this.postage.abortController = value
  }

  /**
   * Redirect to login page
   *
   * @param returnUrl Redirect url after login (default = null)
   */
  loginRedirect(returnUrl: string | null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.loginPath + `?ReturnUrl=${retUrl}`
  }

  /**
   * Redirect to logout page
   *
   * @param returnUrl Redirect url after logout (default = null)
   */
  logoutRedirect(returnUrl: string | null = null) {
    const retUrl = encodeURIComponent(returnUrl || window.location.href)
    window.location.href = this.logoutPath + `?ReturnUrl=${retUrl}`
  }

  static get defaultHost(): string {
    const localUrl = parseLocalStorage<string>("setting:gateway-url")
    if (isSafeURL(localUrl)) {
      return urlOrigin(localUrl!)!
    }
    return urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)!
  }

  static get defaultApiPath(): string {
    const localUrl = parseLocalStorage<string>("setting:gateway-url")
    if (isSafeURL(localUrl)) {
      return safeURL(localUrl)!.pathname
    }
    return safeURL(import.meta.env.VITE_APP_GATEWAY_URL)!.pathname
  }
}

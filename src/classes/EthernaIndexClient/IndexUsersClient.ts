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

import type {
  IndexCurrentUser,
  IndexUser,
  IndexVideo,
  PaginatedResult,
} from "@/definitions/api-index"
import http from "@/utils/request"

export default class IndexUsersClient {
  url: string
  abortController?: AbortController

  /**
   * Init an index users client
   * @param url Api host + api url
   */
  constructor(url: string, abortController?: AbortController) {
    this.url = url
    this.abortController = abortController
  }

  /**
   * Get a list of recent users
   * @param page Page offset (default = 0)
   * @param take Count of users to get (default = 25)
   */
  async fetchUsers(page = 0, take = 25) {
    const endpoint = `${this.url}/users`

    const resp = await http.get<IndexUser[]>(endpoint, {
      params: { page, take },
      signal: this.abortController?.signal,
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch users")
    }

    return resp.data
  }

  /**
   * Get a user info
   * @param address User's address
   */
  async fetchUser(address: string) {
    const endpoint = `${this.url}/users/${address}`

    const resp = await http.get<IndexUser>(endpoint, {
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Fetch user's videos
   * @param address User's address
   */
  async fetchVideos(address: string, page = 0, take = 25) {
    const endpoint = `${this.url}/users/${address}/videos2`

    const resp = await http.get<PaginatedResult<IndexVideo>>(endpoint, {
      params: { page, take },
    })

    if (typeof resp.data !== "object" || !Array.isArray(resp.data.elements)) {
      throw new Error("Cannot fetch user's videos")
    }

    return resp.data
  }

  /**
   * Get the current logged user's info
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get<IndexCurrentUser>(endpoint, {
      withCredentials: true,
      signal: this.abortController?.signal,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }
}

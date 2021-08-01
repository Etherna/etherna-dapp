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

import http from "@utils/request"
import { IndexCurrentUser, IndexUser, IndexUserVideos, IndexVideo } from "./types"

export default class IndexUsersClient {
  url: string

  /**
   * Init an index users client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
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
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch users")
    }

    return resp.data
  }

  /**
   * Get a list of recent users with the recent videos
   * @param page Page offset (default = 0)
   * @param take Count of users to get (default = 25)
   * @param videosTake Count of videos to get (default = 5)
   * @returns List of users with videos
   */
  async fetchUsersWithVideos(page = 0, take = 25, videosTake = 5) {
    const users = (await this.fetchUsers(page, take)) as IndexUserVideos[]
    const usersVideos = await Promise.all(
      users.map(user => this.fetchUserVideos(user.address, 0, videosTake))
    )
    users.forEach((user, i) => {
      user.videos = usersVideos[i]
    })
    return users
  }

  /**
   * Get a user info
   * @param address User's address
   */
  async fetchUser(address: string) {
    const endpoint = `${this.url}/users/${address}`

    const resp = await http.get<IndexUser>(endpoint)

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get the current logged user's info
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get<IndexCurrentUser>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get a list of recent videos by a user
   * @param address User's address
   * @param page Page offset (default = 0)
   * @param take Count of videos to get (default = 25)
   */
  async fetchUserVideos(address: string, page = 0, take = 25) {
    const endpoint = `${this.url}/users/${address}/videos`

    const resp = await http.get<IndexVideo[]>(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch user's videos")
    }

    return resp.data
  }

  /**
   * Update the current logged user's manifest
   * @param newManifest The hash of the new manifest (null to remove)
   */
  async updateCurrentUser(newManifest: string) {
    const endpoint = `${this.url}/users/current`

    await http.put(endpoint, null, {
      params: {
        manifestHash: newManifest
      },
      withCredentials: true
    })

    return true
  }
}

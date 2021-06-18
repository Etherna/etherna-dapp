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
import { GatewayCurrentUser } from "./typings"

export default class GatewayUsersClient {
  url: string

  /**
   * Init an gateway user client
   * @param {string} url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get the current logged user's info
   * @returns Gateway current user
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get<GatewayCurrentUser>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get current user's credit
   * @returns User's credit amount
   */
  async fetchCredit() {
    const endpoint = `${this.url}/users/current/credit`

    const resp = await http.get<number>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch user's credit")
    }

    return resp.data
  }
}

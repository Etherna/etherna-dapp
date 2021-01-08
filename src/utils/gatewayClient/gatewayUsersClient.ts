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

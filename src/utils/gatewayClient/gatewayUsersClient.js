import http from "@utils/request"

export default class GatewayUsersClient {
  /**
   * Init an gateway user client
   * @param {string} url Api host + api url
   */
  constructor(url) {
    this.url = url
  }

  /**
   * Get the current logged user's info
   * @returns {import(".").GatewayCurrentUser}
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get current user's credit
   * @returns {number} User's credit amount
   */
  async fetchCredit() {
    const endpoint = `${this.url}/users/current/credit`

    const resp = await http.get(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch user's credit")
    }

    return resp.data
  }
}

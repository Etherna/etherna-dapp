import http from "@utils/request"

export default class GatewaySettingsClient {
  /**
   * Init an gateway settings client
   * @param {string} url Api host + api url
   */
  constructor(url) {
    this.url = url
  }

  /**
   * Get the current logged user's info
   * @returns {import(".").GatewayCurrentUser}
   */
  async fetchCurrentBytePrice() {
    const endpoint = `${this.url}/system/byteprice`

    const resp = await http.get(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch byte price")
    }

    return resp.data
  }
}

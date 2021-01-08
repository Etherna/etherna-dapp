import http from "@utils/request"

export default class GatewaySettingsClient {
  url: string

  /**
   * Init an gateway settings client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get the current byte price
   * @returns Dollar price per single byte
   */
  async fetchCurrentBytePrice() {
    const endpoint = `${this.url}/system/byteprice`

    const resp = await http.get<number>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch byte price")
    }

    return resp.data
  }
}

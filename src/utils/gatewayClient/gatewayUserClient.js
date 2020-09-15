import axios from "axios"

export default class GatewayUserClient {
  /**
   * Init an gateway user client
   * @param {string} url Api host + api url
   */
  constructor(url) {
    this.url = url
  }

  /**
   * Get current user's credit
   * @returns {number} User's credit amount
   */
  async fetchCredit() {
    const endpoint = `${this.url}/user/credit`

    const resp = await axios.get(endpoint)

    if (typeof resp.data !== "number") {
      throw new Error("Cannot fetch user's credit")
    }

    return resp.data
  }

  /**
   * Get current user's transaction history
   * @param {number} page Page offset (default = 0)
   * @param {number} take Count of users to get (default = 25)
   * @returns {import(".").GatewayTransaction[]} User's transactions
   */
  async fetchTransactions(page = 0, take = 25) {
    const endpoint = `${this.url}/user/logs`

    const resp = await axios.get(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch user's transactions")
    }

    return resp.data
  }
}

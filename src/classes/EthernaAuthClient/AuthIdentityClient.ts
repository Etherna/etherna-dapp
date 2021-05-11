import http from "@utils/request"
import { AuthIdentity } from "./types"

export default class AuthIdentityClient {
  url: string

  /**
   * Init an sso identity client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get current SSO user
   */
  async fetchCurrentIdentity() {
    const endpoint = `${this.url}/identity`

    const resp = await http.get<AuthIdentity>(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch identity")
    }

    return resp.data
  }

}

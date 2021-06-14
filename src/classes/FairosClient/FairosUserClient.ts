import qs from "querystring"

import http from "@utils/request"
import { FairosPodsLS } from "./types"

const POD_NAME = import.meta.env.VITE_APP_FAIRDRIVE_PODNAME

export default class IndexUsersClient {
  url: string

  /**
   * Init an fairos user client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Login and returns the default pod
   * @param username Username
   * @param password Password
   * @returns The default pod instance
   */
  async login(username: string, password: string) {
    const requestBody = {
      user: username,
      password: password,
    }

    const endpoint = `${this.url}/user/login`
    await http.post(endpoint, qs.stringify(requestBody), {
      withCredentials: true
    })

    return await this.openDefaultPod(password)
  }

  /**
   * Check if a user is logged in
   * @param username Username
   */
  isLoggedIn = async (username: string) => {
    try {
      const requestBody = {
        user: username,
      }

      const endpoint = `${this.url}/user/isloggedin`
      const response = await http.get(endpoint, {
        params: qs.stringify(requestBody, "brackets"),
        withCredentials: true,
      })

      return response
    } catch (error) {
      throw error
    }
  }

  private async openDefaultPod(password: string) {
    const podsEndpoint = `${this.url}/pod/ls`
    const { data: pods } = await http.get<FairosPodsLS>(podsEndpoint, {
      withCredentials: true
    })

    if (!pods.pod_name.includes(POD_NAME)) {
      const podEndpoint = `${this.url}/pod/new`
      await http.post(podEndpoint, qs.stringify({ password: password, pod: POD_NAME }), {
        withCredentials: true,
      })
    }

    const podOpenEndpoint = `${this.url}/pod/open`
    const { data: openPod } = await http.post(podOpenEndpoint, qs.stringify({ password: password, pod: POD_NAME }), {
      withCredentials: true,
    })

    return openPod
  }
}

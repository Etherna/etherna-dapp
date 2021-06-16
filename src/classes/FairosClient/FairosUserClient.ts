import qs from "querystring"

import http from "@utils/request"
import { FairosDir, FairosPodsLS } from "./types"

const POD_NAME = import.meta.env.VITE_APP_FAIRDRIVE_PODNAME
const ETHERNA_DIR_NAME = "etherna"

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

    await this.openDefaultPod(password)
    await this.createDefaultEthernaDir()
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      const endpoint = `${this.url}/user/logout`
      await http.post(endpoint, null, {
        withCredentials: true
      })
    } catch { }
  }

  /**
   * Check if a user is logged in
   * @param username Username
   */
  isLoggedIn = async (username: string) => {
    const endpoint = `${this.url}/user/isloggedin`
    const { data } = await http.get<{ loggedin: boolean }>(endpoint, {
      params: {
        user: username
      },
      withCredentials: true,
    })

    return data.loggedin
  }

  private async openDefaultPod(password: string) {
    try {
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
    } catch (error) {
      return null
    }
  }

  private async createDefaultEthernaDir() {
    try {
      const podsEndpoint = `${this.url}/dir/ls`
      const { data: dir } = await http.get<FairosDir>(podsEndpoint, {
        params: {
          dir: "/"
        },
        withCredentials: true
      })

      console.log('dir result', dir);


      const ethernaDir = dir.entries.find(entry => entry.content_type === "inode/directory" && entry.name === ETHERNA_DIR_NAME)

      if (!ethernaDir) {
        // create etherna folder
        await this.createFolder(ETHERNA_DIR_NAME)
      }
    } catch (error) {
      console.error(error)
    }
  }

  private async createFolder(name: string) {
    try {
      const podsEndpoint = `${this.url}/dir/mkdir`
      await http.post(podsEndpoint, qs.stringify({ dir: name }), {
        withCredentials: true
      })
    } catch (error) {
      console.error(error)
    }
  }
}

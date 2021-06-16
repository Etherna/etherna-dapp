import qs from "querystring"

import http from "@utils/request"
import { FairosPodsLS } from "./types"

const POD_NAME = import.meta.env.VITE_APP_FAIRDRIVE_PODNAME

export default class FairosPodClient {
  url: string

  /**
   * Init an fairos user client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Open the default pod or create one if non existing
   * @param password The account password
   * @returns The open pod
   */
  async openDefaultPod(password: string) {
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

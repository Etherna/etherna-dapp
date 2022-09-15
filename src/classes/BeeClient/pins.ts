import type BeeClient from "."

const pinsEndpoint = "/pins"

export default class Pins {
  constructor(private instance: BeeClient) {}

  async pin(reference: string) {
    await this.instance.request.post(`${pinsEndpoint}/${reference}`)
  }

  async unpin(reference: string) {
    await this.instance.request.delete(`${pinsEndpoint}/${reference}`)
  }

  /**
   * Check if pinning is enabled on the current host
   *
   * @returns True if pinning is enabled
   */
  async pinEnabled() {
    try {
      const controller = new AbortController()
      await this.instance.request.get(pinsEndpoint, {
        signal: controller.signal,
        onDownloadProgress: p => {
          controller.abort()
        },
      })
      return true
    } catch {
      return false
    }
  }
}

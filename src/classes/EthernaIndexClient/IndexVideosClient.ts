import http from "@utils/request"
import { IndexVideo } from "./types"

export default class IndexVideosClient {
  url: string

  /**
   * Init an index video client
   * @param url Api host + api url
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * Get a list of recent videos uploaded on the platform
   * @param page Page offset (default = 0)
   * @param take Count of videos to get (default = 25)
   */
  async fetchVideos(page = 0, take = 25) {
    const endpoint = `${this.url}/videos`
    const resp = await http.get<IndexVideo[]>(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch videos")
    }

    return resp.data
  }


  /**
   * Get video information
   * @param hash Video hash on Swarm
   */
  async fetchVideo(hash: string) {
    const endpoint = `${this.url}/videos/${hash}`
    const resp = await http.get<IndexVideo>(endpoint)

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch the video")
    }

    return resp.data
  }

  /**
   * Create a new video on the index
   * @param hash Hash of the manifest/feed with the video metadata
   * @param encryptionKey Encryption key
   * @returns Video info
   */
  async createVideo(hash: string, encryptionKey?: string) {
    const endpoint = `${this.url}/videos`
    const resp = await http.post<IndexVideo>(endpoint, {
      manifestHash: hash,
      encryptionKey,
      encryptionType: encryptionKey ? "AES256" : "Plain",
    }, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot create the video")
    }

    return resp.data
  }

  /**
   * Update a video information
   * @param hash Hash of the video on Swarm
   * @param newHash New manifest hash with video metadata
   * @returns Video info
   */
  async updateVideo(hash: string, newHash: string) {
    const endpoint = `${this.url}/videos/${hash}`
    const resp = await http.put<IndexVideo>(endpoint, null, {
      params: {
        newHash,
      },
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot update the video")
    }

    return resp.data
  }

  /**
   * Delete a video from the index
   * @param hash Hash of the video
   * @returns Success state
   */
  async deleteVideo(hash: string) {
    const endpoint = `${this.url}/videos/${hash}`
    await http.delete(endpoint, {
      withCredentials: true
    })

    return true
  }
}

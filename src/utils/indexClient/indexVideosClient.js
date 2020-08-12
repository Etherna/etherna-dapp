import axios from "axios"

export default class IndexVideosClient {
  /**
   * Init an index video client
   * @param {string} url Api host + api url
   */
  constructor(url) {
    this.url = url
  }

  /**
   * Get a list of recent videos uploaded on the platform
   * @param {number} page Page offset (default = 0)
   * @param {number} take Count of videos to get (default = 25)
   * @returns {import(".").IndexVideo[]}
   */
  async fetchVideos(page = 0, take = 25) {
    const endpoint = `${this.url}/videos`
    const resp = await axios.get(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch videos")
    }

    return resp.data
  }


  /**
   * Get video information
   * @param {string} hash Video hash on Swarm
   * @returns {import(".").IndexVideo}
   */
  async fetchVideo(hash) {
    const endpoint = `${this.url}/videos/${hash}`
    const resp = await axios.get(endpoint)

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch the video")
    }

    return resp.data
  }

  /**
   * Create a new video on the index
   * @param {number} hash Hash of the manifest/feed with the video metadata
   * @param {string} encryptionKey Encryption key
   * @param {string} encryptionType Encryption type (default AES256)
   * @returns {import(".").IndexVideo} Video info
   */
  async createVideo(hash, encryptionKey, encryptionType = "AES256") {
    const endpoint = `${this.url}/videos`
    const resp = await axios.post(endpoint, {
      manifestHash: hash,
      encryptionKey,
      encryptionType,
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot create the video")
    }

    return resp.data
  }

  /**
   * Update a video information
   * @param {string} hash Hash of the video on Swarm
   * @param {string} newHash New manifest hash with video metadata
   * @returns {import(".").IndexVideo} Video info
   */
  async updateVideo(hash, newHash) {
    const endpoint = `${this.url}/videos/${hash}`
    const resp = await axios.put(endpoint, null, {
      params: {
        newHash,
      },
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot update the video")
    }

    return resp.data
  }

  /**
   * Delete a video from the index
   * @param {string} hash Hash of the video
   * @returns {boolean} Success state
   */
  async deleteVideo(hash) {
    const endpoint = `${this.url}/videos/${hash}`
    await axios.delete(endpoint)

    return true
  }
}

import http from "@utils/request"

export default class IndexUsersClient {
  /**
   * Init an index users client
   * @param {string} url Api host + api url
   */
  constructor(url) {
    this.url = url
  }

  /**
   * Get a list of recent users
   * @param {number} page Page offset (default = 0)
   * @param {number} take Count of users to get (default = 25)
   * @returns {import(".").IndexUser[]}
   */
  async fetchUsers(page = 0, take = 25) {
    const endpoint = `${this.url}/users`

    const resp = await http.get(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch users")
    }

    return resp.data
  }

  /**
   * Get a list of recent users with the recent videos
   * @param {number} page Page offset (default = 0)
   * @param {number} take Count of users to get (default = 25)
   * @param {number} videosTake Count of videos to get (default = 5)
   * @returns {import(".").IndexUserVideos[]} List of users with videos
   */
  async fetchUsersWithVideos(page = 0, take = 25, videosTake = 5) {
    /** @type {import(".").IndexUserVideos[]} */
    const users = await this.fetchUsers(page, take)
    const usersVideos = await Promise.all(
      users.map(user => this.fetchUserVideos(user.address, 0, videosTake))
    )
    users.forEach((user, i) => {
      user.videos = usersVideos[i]
    })
    return users
  }

  /**
   * Get a user info
   * @param {string} address User's address
   * @returns {import(".").IndexUser}
   */
  async fetchUser(address) {
    const endpoint = `${this.url}/users/${address}`

    const resp = await http.get(endpoint)

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get the current logged user's info
   * @returns {import(".").IndexCurrentUser}
   */
  async fetchCurrentUser() {
    const endpoint = `${this.url}/users/current`

    const resp = await http.get(endpoint, {
      withCredentials: true
    })

    if (typeof resp.data !== "object") {
      throw new Error("Cannot fetch user")
    }

    return resp.data
  }

  /**
   * Get a list of recent videos by a user
   * @param {string} address User's address
   * @param {number} page Page offset (default = 0)
   * @param {number} take Count of videos to get (default = 25)
   * @returns {import('.').IndexVideo[]}
   */
  async fetchUserVideos(address, page = 0, take = 25) {
    const endpoint = `${this.url}/users/${address}/videos`

    const resp = await http.get(endpoint, {
      params: { page, take },
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch user's videos")
    }

    return resp.data
  }

  /**
   * Update the current logged user's manifest
   * @param {string} newManifest The hash of the new manifest (null to remove)
   * @returns {boolean} Success state
   */
  async updateCurrentUser(newManifest) {
    const endpoint = `${this.url}/users/current`

    await http.put(endpoint, null, {
      params: {
        manifestHash: newManifest
      },
      withCredentials: true
    })

    return true
  }
}

/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import http from "@utils/request"
import type { IndexVideo, IndexVideoComment, VoteValue } from "@definitions/api-index"

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
   * @param take Number of videos to fetch (default = 25)
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

  /**
   * Fetch the video comments
   * @param hash Hash of the video
   * @param page Page offset (default = 0)
   * @param take Number of comments to fetch (default = 25)
   * @returns The list of comments
   */
  async fetchComments(hash: string, page = 0, take = 25) {
    const endpoint = `${this.url}/videos/${hash}/comments`
    const resp = await http.get<IndexVideoComment[]>(endpoint, {
      params: { page, take },
      withCredentials: true
    })

    if (!Array.isArray(resp.data)) {
      throw new Error("Cannot fetch comments")
    }

    return resp.data
  }

  /**
   * Post a new comment to a video
   * @param hash Hash of the video
   * @param message Message string with markdown
   * @returns The comment object
   */
  async postComment(hash: string, message: string) {
    const endpoint = `${this.url}/videos/${hash}/comments`
    const resp = await http.post<IndexVideoComment>(endpoint, `"${message}"`, {
      withCredentials: true,
      headers: {
        "accept": "text/plain",
        "content-type": "application/json",
      }
    })

    return resp.data
  }

  /**
   * Give a up/down vote to the video
   * @param hash Hash of the video
   * @param vote Up / Down / Neutral vote
   */
  async vote(hash: string, vote: VoteValue) {
    const endpoint = `${this.url}/videos/${hash}/votes`
    const resp = await http.post<IndexVideoComment>(endpoint, null, {
      params: {
        value: vote
      },
      withCredentials: true
    })

    return resp.data
  }
}

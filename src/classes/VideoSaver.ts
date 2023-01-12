import { EthernaPinningHandler, EthernaResourcesHandler } from "@etherna/api-js/handlers"

import SwarmPlaylist from "./SwarmPlaylist"
import SwarmUserPlaylists from "./SwarmUserPlaylists"
import uiStore from "@/stores/ui"
import { deepCloneObject } from "@/utils/object"
import { getResponseErrorMessage } from "@/utils/request"

import type BeeClient from "./BeeClient"
import type { PublishStatus, VideoEditorPublishSource } from "@/stores/video-editor"
import type { Playlist, UserPlaylists, Video } from "@etherna/api-js"
import type { EthernaGatewayClient, EthernaIndexClient, Reference } from "@etherna/api-js/clients"
import type { VideoBuilder } from "@etherna/api-js/swarm"
import type { AxiosError } from "axios"

type VideoSaverOptions = {
  initialReference: Reference | undefined
  previusReferences: Reference[]
  saveTo: VideoEditorPublishSource[]
  channelPlaylist: Playlist | undefined
  userPlaylists: UserPlaylists | undefined
  isWalletConnected: boolean
  beeClient: BeeClient
  gatewayClient: EthernaGatewayClient
  indexClient: EthernaIndexClient
}

type VideoSaverRequestOptions = {
  saveManifest: boolean
  offerResources: boolean
  pinResources: boolean
  previusResults: PublishStatus[]
}

export default class VideoSaver {
  constructor(private videoBuilder: VideoBuilder, private options: VideoSaverOptions) {}

  async save(opts: VideoSaverRequestOptions) {
    const { initialReference, previusReferences, saveTo } = this.options

    // save manifest
    if (opts.saveManifest && !this.validateMetadata()) return
    const newReference = opts.saveManifest
      ? await this.uploadManifest()
      : this.videoBuilder.reference

    if (!newReference) return

    const referencesToRemove = previusReferences.filter(ref => ref !== newReference)

    // Unoffer previous resources before offering new ones
    if (opts.saveManifest && initialReference) {
      const offered = await this.unofferVideoResources(referencesToRemove)
      if (!offered) {
        console.error("Coudn't un-offer previous resources")
      }
    }

    // Unpin previous resources before pinning new ones
    if (opts.saveManifest && initialReference) {
      const offered = await this.unpinVideoResources(referencesToRemove)
      if (!offered) {
        console.error("Coudn't un-offer previous resources")
      }
    }

    // Offer resources
    if (opts.offerResources) {
      const offered = await this.offerVideoResources([newReference])
      if (!offered) {
        console.error("Coudn't offer resources")
      }
    }

    // Pin resources
    if (opts.pinResources) {
      const pinned = await this.pinVideoResources([newReference])
      if (!pinned) {
        console.error("Coudn't pin resources")
      }
    }

    // Add/remove to sources
    const newPublishResults: PublishStatus[] = JSON.parse(JSON.stringify(opts.previusResults ?? []))
    for (const source of saveTo) {
      // don't remove on creation
      if (!source.add && !initialReference) continue

      let statusIndex = newPublishResults.findIndex(
        ps => ps.source.source === source.source && ps.source.identifier === source.identifier
      )

      if (statusIndex === -1) {
        const fullSource = saveTo.find(
          s => s.source === source.source && s.identifier === source.identifier
        )!
        newPublishResults.push({ source: fullSource, ok: false, type: "add" })
        statusIndex = newPublishResults.length - 1
      }

      const newVideo: Video = {
        ...this.videoBuilder.getVideo("http://localhost:1633"),
        reference: newReference,
      }

      if (source.source === "playlist") {
        if (source.add) {
          const ok = await this.addToPlaylist(initialReference, newVideo, source.identifier)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "add"
        } else {
          const ok = await this.removeFromPlaylist(newReference)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "remove"
        }
      } else if (source.source === "index") {
        const indexReference = this.getVideoIndexId(source.identifier)
        if (source.add) {
          const ok = await this.addToIndex(indexReference, newVideo)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "add"
        } else {
          const ok = await this.removeFromIndex(indexReference)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "remove"
        }
      }
    }

    return newPublishResults
  }

  checkAccountability() {
    if (!this.options.isWalletConnected) {
      uiStore.getState().showError("Wallet Locked", "Please unlock your wallet before saving.")
      return false
    }

    return true
  }

  checkChannel() {
    if (!this.options.channelPlaylist) {
      uiStore.getState().showError("Channel error", "Channel video list not fetched correctly.")
      return false
    }

    return true
  }

  async addToPlaylist(initialReference: Reference | undefined, video: Video, playlistId: string) {
    if (!this.checkChannel()) return false
    if (!this.checkAccountability()) return false

    try {
      const playlist = deepCloneObject(this.options.channelPlaylist!)
      const playlistHasVideo =
        playlist.videos.findIndex(video => video.reference === initialReference) >= 0

      if (playlistHasVideo) {
        // remove from playlist
        playlist.videos = playlist.videos.filter(video => video.reference !== initialReference)
      }
      // add video to playlist
      playlist.videos.push({
        reference: video.reference,
        title: video.preview.title,
        addedAt: Date.now(),
        publishedAt: undefined,
      })

      await this.updateChannelAndUser(playlist)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async removeFromPlaylist(reference: Reference | undefined) {
    if (!this.checkChannel()) return false
    if (!this.checkAccountability()) return false

    try {
      const playlist = deepCloneObject(this.options.channelPlaylist!)
      playlist.videos = playlist.videos.filter(video => video.reference !== reference)
      await this.updateChannelAndUser(playlist)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updateChannelAndUser(channel: Playlist) {
    // save playlist
    const playlistWriter = new SwarmPlaylist.Writer(channel, {
      beeClient: this.options.beeClient,
    })
    const reference = await playlistWriter.upload()
    // save user playlists
    const userPlaylists: UserPlaylists = {
      ...(this.options.userPlaylists ?? {
        channel: null,
        saved: null,
        custom: [],
      }),
      channel: reference,
    }
    const userPlaylistsWriter = new SwarmUserPlaylists.Writer(userPlaylists, {
      beeClient: this.options.beeClient,
    })
    await userPlaylistsWriter.upload()
  }

  async addToIndex(initialVideoId: string | undefined, video: Video) {
    try {
      const indexClient = this.options.indexClient
      if (initialVideoId) {
        await indexClient.videos.updateVideo(initialVideoId, video.reference)
      } else {
        await indexClient.videos.createVideo(video.reference)
      }
      return true
    } catch (error) {
      const axiosError = error as AxiosError
      const data = (axiosError.response?.data as any) ?? ""
      if (/duplicate/i.test(data.toString()) && axiosError.response?.status === 400) {
        return true
      }
      return false
    }
  }

  async removeFromIndex(videoId: string | undefined) {
    if (!videoId) return true

    try {
      const indexClient = this.options.indexClient
      await indexClient.videos.deleteVideo(videoId)
      return true
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        return true
      }
      return false
    }
  }

  validateMetadata() {
    const { duration } = this.videoBuilder.previewMeta
    const { batchId } = this.videoBuilder.detailsMeta!

    if (!duration) {
      uiStore
        .getState()
        .showError(
          "Metadata error",
          "There was a problem loading the video metadata. Try to re-upload the original video."
        )
      return false
    }

    if (!batchId) {
      uiStore
        .getState()
        .showError("Postage batch error", "Postage batch is missing. Cannot save video.")
      return false
    }

    return true
  }

  async uploadManifest() {
    if (!this.checkAccountability()) return

    try {
      const newReference = await this.videoBuilder.saveNode({
        beeClient: this.options.beeClient,
      })
      return newReference
    } catch (error: any) {
      console.error(error)
      uiStore.getState().showError("Manifest error", getResponseErrorMessage(error))
      return null
    }
  }

  getVideoIndexId(indexUrl: string) {
    return this.options.saveTo.find(s => s.source === "index" && s.identifier === indexUrl)!.videoId
  }

  async offerVideoResources(references: Reference[]) {
    try {
      const handler = new EthernaResourcesHandler(references, {
        gatewayClient: this.options.gatewayClient,
      })
      await handler.offerResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async pinVideoResources(references: Reference[]) {
    try {
      const handler = new EthernaPinningHandler(references, { client: this.options.gatewayClient })
      await handler.pinResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async unpinVideoResources(references: Reference[]) {
    try {
      // using 'old' video reference to unoffer resources
      const handler = new EthernaPinningHandler(references, { client: this.options.gatewayClient })
      await handler.unpinResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async unofferVideoResources(references: Reference[]) {
    try {
      // using 'old' video reference to unoffer resources
      const handler = new EthernaResourcesHandler(references, {
        gatewayClient: this.options.gatewayClient,
      })
      await handler.unofferResources()
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

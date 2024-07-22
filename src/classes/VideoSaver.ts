import { EthernaPinningHandler, EthernaResourcesHandler } from "@etherna/sdk-js/handlers"
import { PlaylistBuilder } from "@etherna/sdk-js/swarm"
import { isEmptyReference } from "@etherna/sdk-js/utils"

import SwarmPlaylist from "./SwarmPlaylist"
import uiStore from "@/stores/ui"
import { deepCloneObject } from "@/utils/object"
import { getResponseErrorMessage } from "@/utils/request"

import type BeeClient from "./BeeClient"
import type { PublishStatus, VideoEditorPublishSource } from "@/stores/video-editor"
import type { Playlist, Video } from "@etherna/sdk-js"
import type { EthernaGatewayClient, EthernaIndexClient, Reference } from "@etherna/sdk-js/clients"
import type { VideoBuilder } from "@etherna/sdk-js/swarm"
import type { AxiosError } from "axios"

type VideoSaverOptions = {
  initialReference: Reference | undefined
  previusReferences: Reference[]
  saveTo: VideoEditorPublishSource[]
  channelPlaylist: Playlist | undefined | null
  channelPlaylists: Playlist[] | undefined
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
  signal?: AbortSignal
}

export default class VideoSaver {
  constructor(
    private videoBuilder: VideoBuilder,
    private options: VideoSaverOptions
  ) {}

  async save(opts: VideoSaverRequestOptions) {
    const { initialReference, previusReferences, saveTo } = this.options

    // save manifest
    if (opts.saveManifest && !this.validateMetadata()) return

    const newReference =
      opts.saveManifest || isEmptyReference(this.videoBuilder.reference)
        ? await this.uploadManifest(opts.signal)
        : this.videoBuilder.reference

    if (!newReference) return

    const referencesToRemove = previusReferences.filter(ref => ref !== newReference)

    if (opts.signal?.aborted) return

    // Unoffer previous resources before offering new ones
    if (opts.saveManifest && initialReference) {
      const offered = await this.unofferVideoResources(referencesToRemove, opts.signal)
      if (!offered) {
        console.error("Coudn't un-offer previous resources")
      }
    }

    if (opts.signal?.aborted) return

    // Unpin previous resources before pinning new ones
    if (opts.saveManifest && initialReference) {
      const offered = await this.unpinVideoResources(referencesToRemove, opts.signal)
      if (!offered) {
        console.error("Coudn't un-offer previous resources")
      }
    }

    if (opts.signal?.aborted) return

    // Offer resources
    if (opts.offerResources) {
      const offered = await this.offerVideoResources([newReference], opts.signal)
      if (!offered) {
        console.error("Coudn't offer resources")
      }
    }

    if (opts.signal?.aborted) return

    // Pin resources
    if (opts.pinResources) {
      const pinned = await this.pinVideoResources([newReference], opts.signal)
      if (!pinned) {
        console.error("Coudn't pin resources")
      }
    }

    if (opts.signal?.aborted) return

    // Add/remove to sources
    const newPublishResults = JSON.parse(
      JSON.stringify(opts.previusResults ?? [])
    ) as PublishStatus[]
    for (const source of saveTo) {
      if (opts.signal?.aborted) return

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
        ...this.videoBuilder.getVideo(this.options.beeClient.url),
        reference: newReference,
      }

      if (source.source === "playlist") {
        if (source.add) {
          const ok = await this.addToPlaylist(
            source.identifier,
            initialReference,
            newVideo,
            opts.signal
          )
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "add"
        } else {
          const ok = await this.removeFromPlaylist(source.identifier, newReference, opts.signal)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "remove"
        }
      } else if (source.source === "index") {
        const indexReference = this.getVideoIndexId(source.identifier)
        if (source.add) {
          const ok = await this.addToIndex(indexReference, newVideo, opts.signal)
          newPublishResults[statusIndex].ok = ok
          newPublishResults[statusIndex].type = "add"
        } else {
          const ok = await this.removeFromIndex(indexReference, opts.signal)
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

  findPlaylist(playlistId: string) {
    const isChannel = playlistId === SwarmPlaylist.Reader.channelPlaylistId
    const playlist = isChannel
      ? this.options.channelPlaylist
      : this.options.channelPlaylists?.find(pl => pl.preview.id === playlistId)

    if (!playlist) {
      uiStore
        .getState()
        .showError("Playlist error", `${isChannel ? "Channel" : "Playlist"} not fetched correctly.`)
      return null
    }

    return playlist
  }

  async addToPlaylist(
    playlistId: string,
    initialReference: Reference | undefined,
    video: Video,
    signal?: AbortSignal
  ) {
    if (!this.checkAccountability()) return false

    const playlist = this.findPlaylist(playlistId)

    if (!playlist) return false

    try {
      const playlistHasVideo =
        playlist.details.videos.findIndex(video => video.reference === initialReference) >= 0

      if (playlistHasVideo) {
        // remove from playlist
        playlist.details.videos = playlist.details.videos.filter(
          video => video.reference !== initialReference
        )
      }
      // add video to playlist
      playlist.details.videos.push({
        reference: video.reference,
        title: video.preview.title,
        addedAt: new Date(),
        publishedAt: undefined,
      })

      await this.updatePlaylist(playlist, signal)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async removeFromPlaylist(
    playlistId: string,
    reference: Reference | undefined,
    signal?: AbortSignal
  ) {
    if (!this.checkAccountability()) return false

    const playlist = this.findPlaylist(playlistId)

    if (!playlist) return false

    try {
      const playlist = deepCloneObject(this.options.channelPlaylist!)
      playlist.details.videos = playlist.details.videos.filter(
        video => video.reference !== reference
      )
      await this.updatePlaylist(playlist, signal)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updatePlaylist(playlist: Playlist, signal?: AbortSignal) {
    const builder = new PlaylistBuilder()
    builder.initialize(
      playlist.reference,
      playlist.preview.owner,
      playlist.preview,
      playlist.details
    )
    await builder.loadNode({ beeClient: this.options.beeClient })

    const playlistWriter = new SwarmPlaylist.Writer(builder, {
      beeClient: this.options.beeClient,
    })

    const batchId = this.videoBuilder.detailsMeta!.batchId ?? undefined

    await playlistWriter.upload({ batchId, signal })
  }

  async addToIndex(initialVideoId: string | undefined, video: Video, signal?: AbortSignal) {
    try {
      const indexClient = this.options.indexClient
      if (initialVideoId) {
        await indexClient.videos.updateVideo(initialVideoId, video.reference, { signal })
      } else {
        await indexClient.videos.createVideo(video.reference, undefined, { signal })
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

  async removeFromIndex(videoId: string | undefined, signal?: AbortSignal) {
    if (!videoId) return true

    try {
      const indexClient = this.options.indexClient
      await indexClient.videos.deleteVideo(videoId, { signal })
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

  async uploadManifest(signal?: AbortSignal) {
    if (!this.checkAccountability()) return

    try {
      const newReference = await this.videoBuilder.saveNode({
        beeClient: this.options.beeClient,
        signal,
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

  async offerVideoResources(references: Reference[], signal?: AbortSignal) {
    try {
      const handler = new EthernaResourcesHandler(references, {
        gatewayClient: this.options.gatewayClient,
      })
      await handler.offerResources({ signal })
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async pinVideoResources(references: Reference[], signal?: AbortSignal) {
    try {
      const handler = new EthernaPinningHandler(references, { client: this.options.gatewayClient })
      await handler.pinResources({ signal })
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async unpinVideoResources(references: Reference[], signal?: AbortSignal) {
    try {
      // using 'old' video reference to unoffer resources
      const handler = new EthernaPinningHandler(references, { client: this.options.gatewayClient })
      await handler.unpinResources({ signal })
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async unofferVideoResources(references: Reference[], signal?: AbortSignal) {
    try {
      // using 'old' video reference to unoffer resources
      const handler = new EthernaResourcesHandler(references, {
        gatewayClient: this.options.gatewayClient,
      })
      await handler.unofferResources({ signal })
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

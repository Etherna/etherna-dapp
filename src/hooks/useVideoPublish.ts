import { useCallback, useEffect } from "react"

import useErrorMessage from "./useErrorMessage"
import useUserPlaylists from "./useUserPlaylists"
import useWallet from "./useWallet"
import IndexClient from "@/classes/IndexClient"
import useUserStore from "@/stores/user"

import type { Video } from "@etherna/api-js"
import type { Reference } from "@etherna/api-js/clients"
import type { AxiosError } from "axios"

export default function useVideoPublish() {
  const address = useUserStore(state => state.address!)
  const { isLocked } = useWallet()
  const { showError } = useErrorMessage()

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
    playlistHasVideo,
  } = useUserPlaylists(address!, { fetchChannel: true })

  useEffect(() => {
    if (address && !channelPlaylist) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const checkAccountability = useCallback(() => {
    if (isLocked) {
      showError("Wallet Locked", "Please unlock your wallet before saving.")
      return false
    }

    return true
  }, [isLocked, showError])

  const checkChannel = useCallback(() => {
    if (!channelPlaylist) {
      showError("Channel error", "Channel video list not fetched correctly.")
      return false
    }

    return true
  }, [channelPlaylist, showError])

  const addToPlaylist = useCallback(
    async (initialReference: Reference | undefined, video: Video, playlistId: string) => {
      if (!checkChannel()) return false
      if (!checkAccountability()) return false

      try {
        const isUpdate = initialReference && playlistHasVideo(playlistId, initialReference)
        !isUpdate && (await addVideosToPlaylist(playlistId, [video]))
        isUpdate && (await updateVideoInPlaylist(playlistId, initialReference, video))
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [
      checkChannel,
      checkAccountability,
      playlistHasVideo,
      addVideosToPlaylist,
      updateVideoInPlaylist,
    ]
  )

  const removeFromPlaylist = useCallback(
    async (reference: Reference | undefined, playlistId: string) => {
      if (!checkChannel()) return false
      if (!checkAccountability()) return false

      try {
        reference && (await removeVideosFromPlaylist(playlistId, [reference]))
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [checkAccountability, checkChannel, removeVideosFromPlaylist]
  )

  const addToIndex = useCallback(
    async (initialVideoId: string | undefined, video: Video, indexUrl: string) => {
      try {
        const indexClient = new IndexClient(indexUrl)
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
    },
    []
  )

  const removeFromIndex = useCallback(async (videoId: string | undefined, indexUrl: string) => {
    if (!videoId) return true

    try {
      const indexClient = new IndexClient(indexUrl)
      await indexClient.videos.deleteVideo(videoId)
      return true
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        return true
      }
      return false
    }
  }, [])

  return {
    addToPlaylist,
    removeFromPlaylist,
    addToIndex,
    removeFromIndex,
  }
}

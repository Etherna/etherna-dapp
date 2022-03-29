import { useEffect, useState } from "react"

import useVideoEditorState from "./useVideoEditorState"
import useUserPlaylists from "@hooks/useUserPlaylists"
import useSelector from "@state/useSelector"
import { useErrorMessage } from "@state/hooks/ui"
import { useWallet } from "@state/hooks/env"
import { Profile } from "@definitions/swarm-profile"

type SaveOpts = {
  saveManifest: boolean
  saveToChannel: boolean
  saveToIndex: boolean
}

export default function useVideoEditorSaveActions() {
  const [state] = useVideoEditorState()
  const { videoWriter, saveTo, reference: initialReference } = state
  const { indexClient } = useSelector(state => state.env)
  const { address, batches } = useSelector(state => state.user)
  const profile = useSelector(state => state.profile)
  const { isLocked } = useWallet()

  const [reference, setReference] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [addedToChannel, setAddedToChannel] = useState<boolean>()
  const [addedToIndex, setAddedToIndex] = useState<boolean>()

  const { showError } = useErrorMessage()

  const {
    channelPlaylist,
    loadPlaylists,
    addVideosToPlaylist,
    updateVideoInPlaylist,
    removeVideosFromPlaylist,
  } = useUserPlaylists(address!, { resolveChannel: true })

  useEffect(() => {
    if (address) {
      loadPlaylists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const saveVideo = async (opts: SaveOpts) => {
    const { saveManifest, saveToChannel, saveToIndex } = opts

    setIsSaving(true)

    // Upload metadata
    if (saveManifest && !validateMetadata()) return setIsSaving(false)
    const newReference = saveManifest ? await uploadManifest() : reference
    if (!newReference) return setIsSaving(false)

    // Add/Remove to channel
    if (saveToChannel) {
      setAddedToChannel(undefined)

      if (saveTo === "channel" || saveTo === "channel-index") {
        const added = await addToChannel()
        setAddedToChannel(added)

        !added && showError("Cannot add to channel", "Try again later.")
      } else if (initialReference) {
        await removeFromChannel()
      }
    }

    // Add/Remove to index
    if (saveToIndex) {
      setAddedToIndex(undefined)

      if (saveTo === "channel-index") {
        const added = await addToIndex()
        setAddedToIndex(added)

        !added && showError("Cannot add to current index", "Try again later.")
      } else if (initialReference) {
        await removeFromIndex()
      }
    }

    setReference(newReference)
    setIsSaving(false)
  }

  const resetState = () => {
    setAddedToChannel(undefined)
    setAddedToIndex(undefined)
    setReference(undefined)
    setIsSaving(false)
  }

  const checkAccountability = () => {
    if (!batches || batches.length === 0) {
      showError("Cannot upload", "You don't have any storage yet.")
      return false
    }

    if (isLocked) {
      showError("Wallet Locked", "Please unlock your wallet before saving.")
      return false
    }

    return true
  }

  const checkChannel = () => {
    if (!channelPlaylist) {
      showError("Channel error", "Channel video list not fetched correctly.")
      return false
    }

    return true
  }

  const validateMetadata = () => {
    const { duration, originalQuality } = videoWriter.videoRaw

    if (!duration || !originalQuality) {
      showError(
        "Metadata error",
        "There was a problem loading the video metadata. Try to re-upload the original video."
      )
      return false
    }

    return true
  }

  const uploadManifest = async () => {
    if (!checkAccountability()) return

    try {
      const ownerProfile: Profile = {
        address: address!,
        name: profile.name ?? null,
        description: profile.description ?? null,
        avatar: profile.avatar ?? null,
        cover: profile.cover ?? null,
        birthday: profile.birthday,
        location: profile.location,
        website: profile.website,
      }
      const newReference = await videoWriter.update(ownerProfile)
      return newReference
    } catch (error) {
      return null
    }
  }

  const addToChannel = async () => {
    if (!checkChannel()) return
    if (!checkAccountability()) return

    try {
      !initialReference && await addVideosToPlaylist(channelPlaylist!.id, [videoWriter.video!])
      initialReference && await updateVideoInPlaylist(channelPlaylist!.id, initialReference, videoWriter.video!)
      return true
    } catch (error) {
      return false
    }
  }

  const removeFromChannel = async () => {
    if (!checkChannel()) return
    if (!checkAccountability()) return

    try {
      await removeVideosFromPlaylist(channelPlaylist!.id, [videoWriter.reference!])
      return true
    } catch (error) {
      return false
    }
  }

  const addToIndex = async () => {
    try {
      if (videoWriter.indexReference) {
        await indexClient.videos.updateVideo(videoWriter.indexReference, videoWriter.reference!)
      } else {
        await indexClient.videos.createVideo(videoWriter.reference!)
      }
      return true
    } catch (error) {
      return false
    }
  }

  const removeFromIndex = async () => {
    if (!videoWriter.indexReference) return true

    try {
      await indexClient.videos.deleteVideo(videoWriter.indexReference)
      videoWriter.indexReference = undefined
      return true
    } catch (error) {
      return false
    }
  }

  return {
    reference,
    isSaving,
    addedToChannel,
    addedToIndex,
    saveVideo: () => saveVideo({ saveManifest: true, saveToChannel: true, saveToIndex: true }),
    saveVideoToChannel: () => saveVideo({ saveManifest: false, saveToChannel: true, saveToIndex: false }),
    saveVideoToIndex: () => saveVideo({ saveManifest: false, saveToChannel: false, saveToIndex: true }),
    resetState,
  }
}

import React, { useReducer } from "react"
import logger from "use-reducer-logger"

import { VideoEditorContext } from "."
import { reducer } from "./videoEditorReducer"
import VideoEditorCache from "./VideoEditorCache"
import SwarmVideo from "@classes/SwarmVideo"
import { Video } from "@classes/SwarmVideo/types"
import useSelector from "@state/useSelector"
import { Profile } from "@classes/SwarmProfile/types"

type VideoEditorContextWrapperProps = {
  children: React.ReactNode
  reference: string | undefined
  videoData?: Video
}

export const VideoEditorContextWrapper: React.FC<VideoEditorContextWrapperProps> = ({
  children,
  reference,
  videoData
}) => {
  const profile = useSelector(state => state.profile)
  const { address, identityManifest } = useSelector(state => state.user)
  const { beeClient, indexClient } = useSelector(state => state.env)

  const videoProfileData: Profile = {
    address: address!,
    manifest: identityManifest,
    name: profile.name ?? null,
    description: profile.description ?? null,
    birthday: profile.birthday,
    location: profile.location,
    website: profile.website,
    avatar: profile.avatar,
    cover: profile.cover,
  }

  let initialState = VideoEditorCache.hasCache ? VideoEditorCache.loadState(beeClient, indexClient) : null

  if (!initialState) {
    const videoHandler = new SwarmVideo(reference, {
      beeClient,
      indexClient,
      fetchFromCache: false,
      fetchProfile: false,
      videoData,
    })

    initialState = {
      reference,
      queue: [],
      videoHandler,
      pinContent: undefined
    }
  }

  initialState.videoHandler.owner = videoProfileData

  const stateReducer = process.env.NODE_ENV === "development" ? logger(reducer) : reducer
  const store = useReducer(stateReducer, initialState)

  return (
    <VideoEditorContext.Provider value={store}>
      {children}
    </VideoEditorContext.Provider>
  )
}

export default VideoEditorContextWrapper

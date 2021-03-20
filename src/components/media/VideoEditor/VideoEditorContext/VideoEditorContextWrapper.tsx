import React, { useReducer } from "react"

import { VideoEditorContext } from "."
import { reducer } from "./videoEditorReducer"
import VideoEditorCache from "./VideoEditorCache"
import SwarmVideo from "@classes/SwarmVideo"
import { Video } from "@classes/SwarmVideo/types"
import useSelector from "@state/useSelector"

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
  const { beeClient, indexClient } = useSelector(state => state.env)

  let initialState = VideoEditorCache.hasCache ? VideoEditorCache.loadState(beeClient, indexClient) : null

  if (!initialState) {
    const videoHandler = new SwarmVideo(reference, {
      beeClient,
      indexClient,
      fetchFromCache: false,
      fetchProfile: false,
      videoData
    })

    initialState = {
      reference,
      manifest: reference,
      queue: [],
      videoHandler,
      pinContent: undefined
    }
  }

  const store = useReducer(reducer, initialState)

  return (
    <VideoEditorContext.Provider value={store}>
      {children}
    </VideoEditorContext.Provider>
  )
}

export default VideoEditorContextWrapper

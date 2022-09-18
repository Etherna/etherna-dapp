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
 *
 */

import React, { useReducer } from "react"

import { getAllSources, getDefaultAddTo, VideoEditorContext } from "."
import VideoEditorCache from "./VideoEditorCache"
import videoEditorReducer from "./reducer"
import SwarmImage from "@/classes/SwarmImage"
import SwarmVideo from "@/classes/SwarmVideo"
import { THUMBNAIL_QUEUE_NAME } from "@/components/studio/video-editor/ThumbnailUpload"
import type { Video } from "@/definitions/swarm-video"
import type { VideoEditorQueue } from "@/definitions/video-editor-context"
import useSelector from "@/state/useSelector"
import logger from "@/utils/context-logger"

type VideoEditorContextProviderProps = {
  children: React.ReactNode
  reference: string | undefined
  videoData?: Video
}

const VideoEditorContextProvider: React.FC<VideoEditorContextProviderProps> = ({
  children,
  reference,
  videoData,
}) => {
  const { address } = useSelector(state => state.user)
  const { beeClient, gatewayClient, gatewayType } = useSelector(state => state.env)

  let initialState = VideoEditorCache.hasCache
    ? VideoEditorCache.loadState(beeClient, gatewayClient, gatewayType)
    : null

  if (initialState && initialState.reference !== reference) {
    initialState = null
  }

  if (!initialState) {
    const videoWriter = new SwarmVideo.Writer(videoData, address!, {
      beeClient,
      gatewayClient,
      gatewayType,
    })

    initialState = {
      reference,
      videoWriter,
      ownerAddress: address!,
      pinContent: undefined,
      queue: videoWriter.videoRaw.sources
        .map(
          source =>
            ({
              reference: source.reference,
              completion: 100,
              name: SwarmVideo.getSourceName(source.quality),
            } as VideoEditorQueue)
        )
        .concat(
          videoWriter.thumbnail
            ? [
                {
                  reference: SwarmImage.Reader.getOriginalSourceReference(videoWriter.thumbnail),
                  completion: 100,
                  name: THUMBNAIL_QUEUE_NAME,
                },
              ]
            : []
        ),
      saveTo: getDefaultAddTo(),
      sources: getAllSources(),
      isOffered: undefined,
      offerResources: false,
      indexData: [],
      hasChanges: false,
      descriptionExeeded: false,
    }
  }

  const stateReducer = import.meta.env.DEV ? logger(videoEditorReducer) : videoEditorReducer
  const store = useReducer(stateReducer, initialState)

  return <VideoEditorContext.Provider value={store}>{children}</VideoEditorContext.Provider>
}

export default VideoEditorContextProvider

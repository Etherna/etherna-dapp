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

import React, { useState, useEffect, useMemo } from "react"
import classNames from "classnames"

import classes from "@styles/components/video/VideoView.module.scss"

import NotFound from "@common/NotFound"
import SEO from "@components/layout/SEO"
import Player from "@components/player/Player"
import VideoComments from "@components/video/VideoComments"
import VideoDetails from "@components/video/VideoDetails"
import useSwarmVideo from "@hooks/useSwarmVideo"
import { useErrorMessage } from "@state/hooks/ui"
import SwarmImageIO from "@classes/SwarmImage"
import type { Video, VideoOffersStatus } from "@definitions/swarm-video"
import useSelector from "@state/useSelector"

type VideoViewProps = {
  reference: string
  routeState?: { video: Video, videoOffers: VideoOffersStatus }
  embed?: boolean
}

const VideoView: React.FC<VideoViewProps> = ({ reference, routeState, embed }) => {
  const { video, notFound, loadVideo } = useSwarmVideo({
    reference,
    routeState: routeState?.video,
    fetchFromCache: true,
    fetchProfile: true
  })
  const beeClient = useSelector(state => state.env.beeClient)

  const [isFetchingVideo, setIsFetchingVideo] = useState(false)
  const { showError } = useErrorMessage()

  const posterUrl = useMemo(() => {
    const thumbReference = SwarmImageIO.Reader.getOriginalSourceReference(video?.thumbnail)
    if (thumbReference) {
      return beeClient.getBzzUrl(thumbReference)
    }
    return null
  }, [video, beeClient])

  useEffect(() => {
    if (!video) {
      fetchVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  const fetchVideo = async () => {
    setIsFetchingVideo(true)

    try {
      await loadVideo()
    } catch (error: any) {
      console.error(error)
      showError("Cannot load the video", error.message)
    }

    setIsFetchingVideo(false)
  }

  if (notFound) {
    return <NotFound message="This video cannot be found" />
  }

  if (isFetchingVideo || !video) {
    return <div />
  }

  return (
    <>
      <SEO title={video.title || reference} />
      {embed ? (
        <Player
          hash={reference}
          title={video.title || reference}
          owner={video.owner}
          sources={video.sources}
          originalQuality={video.originalQuality}
          thumbnailUrl={posterUrl}
          embed
        />
      ) : (
        <div className={classNames(classes.videoWatch)}>
          <div className="row justify-center">
            <div className="col lg:w-3/4">
              <Player
                hash={reference}
                title={video.title || reference}
                owner={video.owner}
                sources={video.sources}
                originalQuality={video.originalQuality}
                thumbnailUrl={posterUrl}
              />

              <VideoDetails video={video} />

              {video.isVideoOnIndex && (
                <VideoComments videoHash={reference} videoAuthorAddress={video.ownerAddress} />
              )}
            </div>

            <aside className="lg:w-1/4 hidden">
              {/* Eventually a sidebar */}
            </aside>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoView

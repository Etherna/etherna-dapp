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
import React, { useEffect, useMemo, useCallback } from "react"
import classNames from "classnames"

import VideoJsonLd from "./VideoJsonLd"
import SwarmImageIO from "@/classes/SwarmImage"
import NotFound from "@/components/common/NotFound"
import SEO from "@/components/layout/SEO"
import Player from "@/components/player/Player"
import VideoDetails from "@/components/video/VideoDetails"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"
import useResetRouteState from "@/hooks/useResetRouteState"
import useSwarmVideo from "@/hooks/useSwarmVideo"
import routes from "@/routes"
import { useErrorMessage } from "@/state/hooks/ui"
import useSelector from "@/state/useSelector"

type VideoViewProps = {
  reference: string
  routeState?: { video: Video; videoOffers: VideoOffersStatus }
  embed?: boolean
}

const VideoView: React.FC<VideoViewProps> = ({ reference, routeState, embed }) => {
  useResetRouteState()

  const { video, notFound, loadVideo } = useSwarmVideo({
    reference,
    routeState: routeState?.video,
    fetchFromCache: true,
    fetchProfile: true,
  })
  const beeClient = useSelector(state => state.env.beeClient)
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

  const fetchVideo = useCallback(async () => {
    try {
      await loadVideo()
    } catch (error: any) {
      console.error(error)
      showError("Cannot load the video", error.message)
    }
  }, [loadVideo, showError])

  if (notFound) {
    return <NotFound message="This video cannot be found" />
  }

  return (
    <>
      <SEO
        title={video?.title || reference}
        type="video.other"
        image={video?.thumbnail?.src}
        canonicalUrl={video ? routes.withOrigin.watch(video.reference) : undefined}
      >
        {video && (
          <VideoJsonLd
            title={video.title ?? ""}
            description={video.description ?? ""}
            thumbnailUrl={video.thumbnail?.src}
            canonicalUrl={routes.withOrigin.watch(video.reference)}
            contentUrl={video.sources[0].source}
            embedUrl={routes.withOrigin.embed(video.reference)}
            duration={video.duration}
            datePublished={video.createdAt ? new Date(video.createdAt) : undefined}
          />
        )}
      </SEO>

      {embed ? (
        <Player
          hash={reference}
          title={video?.title || reference}
          owner={video?.owner}
          sources={video?.sources ?? []}
          originalQuality={video?.originalQuality}
          thumbnailUrl={posterUrl}
          embed
        />
      ) : (
        <div className="mb-16">
          <div className="row justify-center">
            <div className="col lg:w-3/4">
              <Player
                hash={reference}
                title={video?.title || reference}
                owner={video?.owner}
                sources={video?.sources ?? []}
                originalQuality={video?.originalQuality}
                thumbnailUrl={posterUrl}
              />

              {video && <VideoDetails video={video} videoOffers={routeState?.videoOffers} />}
            </div>

            <aside className="lg:w-1/4 hidden">{/* Eventually a sidebar */}</aside>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoView

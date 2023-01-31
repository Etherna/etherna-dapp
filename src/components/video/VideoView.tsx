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
import removeMarkdown from "remove-markdown"

import VideoJsonLd from "./VideoJsonLd"
import NotFound from "@/components/common/NotFound"
import SEO from "@/components/layout/SEO"
import Player from "@/components/player/Player"
import { Container } from "@/components/ui/layout"
import VideoDetails from "@/components/video/VideoDetails"
import useErrorMessage from "@/hooks/useErrorMessage"
import useResetRouteState from "@/hooks/useResetRouteState"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import useSwarmVideo from "@/hooks/useSwarmVideo"
import routes from "@/routes"

import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import type { VideoWithIndexes } from "@/types/video"
import type { Profile } from "@etherna/api-js"
import type { EthAddress } from "@etherna/api-js/clients"

type VideoViewProps = {
  reference: string
  routeState?: { video: VideoWithIndexes; ownerProfile?: Profile; videoOffers: VideoOffersStatus }
  embed?: boolean
}

const VideoView: React.FC<VideoViewProps> = ({ reference, routeState, embed }) => {
  useResetRouteState()

  const { video, notFound, loadVideo } = useSwarmVideo({
    reference,
    routeState: routeState?.video ?? window.prefetchData?.video,
    fetchIndexStatus: true,
  })
  const { profile, loadProfile } = useSwarmProfile({
    address: video?.preview.ownerAddress as EthAddress,
    prefetchedProfile: routeState?.ownerProfile,
  })
  const { showError } = useErrorMessage()

  const posterUrl = useMemo(() => {
    const posterUrl = video?.preview.thumbnail?.sources.sort((a, b) => b.width - a.width)?.[0]?.url
    if (posterUrl) {
      return posterUrl
    }
    return null
  }, [video])

  useEffect(() => {
    if (!video?.details) {
      fetchVideo()
    } else if (!profile) {
      loadProfile()
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
        title={`${video?.preview.title ?? reference} | ${
          profile?.name || video?.preview.ownerAddress
        }`}
        description={removeMarkdown(video?.details?.description ?? "").replace(/\n/g, "")}
        type="video.other"
        image={video?.preview.thumbnail?.url}
        canonicalUrl={video ? routes.withOrigin.watch(video.reference) : undefined}
      >
        {video && video.details && (
          <VideoJsonLd
            title={video.preview.title ?? ""}
            description={video.details.description ?? ""}
            thumbnailUrl={video.preview.thumbnail?.url}
            canonicalUrl={routes.withOrigin.watch(video.reference)}
            contentUrl={video.details.sources[0].url}
            embedUrl={routes.withOrigin.embed(video.reference)}
            duration={video.preview.duration}
            datePublished={video.preview.createdAt ? new Date(video.preview.createdAt) : undefined}
          />
        )}
      </SEO>

      {embed ? (
        <Player
          hash={reference}
          title={video?.preview.title || reference}
          owner={profile}
          sources={video?.details?.sources ?? []}
          thumbnailUrl={posterUrl}
          embed
        />
      ) : (
        <div className="mb-16">
          <Container fluid align="center" noPaddingX noPaddingY>
            <div className="col lg:w-3/4">
              <Player
                hash={reference}
                title={video?.preview.title || reference}
                owner={profile}
                sources={video?.details?.sources ?? []}
                thumbnailUrl={posterUrl}
              />

              {video && (
                <VideoDetails video={video} owner={profile} videoOffers={routeState?.videoOffers} />
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  )
}

export default VideoView

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
import type { Profile } from "@etherna/api-js"
import type { EthAddress } from "@etherna/api-js/clients"
import removeMarkdown from "remove-markdown"

import VideoJsonLd from "./VideoJsonLd"
import SwarmImage from "@/classes/SwarmImage"
import NotFound from "@/components/common/NotFound"
import SEO from "@/components/layout/SEO"
import Player from "@/components/player/Player"
import { Container } from "@/components/ui/layout"
import VideoDetails from "@/components/video/VideoDetails"
import useErrorMessage from "@/hooks/useErrorMessage"
import useResetRouteState from "@/hooks/useResetRouteState"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import useSwarmVideo from "@/hooks/useSwarmVideo"
import type { VideoOffersStatus } from "@/hooks/useVideoOffers"
import routes from "@/routes"
import useClientsStore from "@/stores/clients"
import type { VideoWithIndexes } from "@/types/video"

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
    address: video?.ownerAddress as EthAddress,
    prefetchedProfile: routeState?.ownerProfile,
  })
  const beeClient = useClientsStore(state => state.beeClient)
  const { showError } = useErrorMessage()

  const posterUrl = useMemo(() => {
    const thumbReference = SwarmImage.Reader.getOriginalSourceReference(video?.thumbnail)
    if (thumbReference) {
      return beeClient.bzz.url(thumbReference)
    }
    return null
  }, [video, beeClient])

  useEffect(() => {
    if (!video) {
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
        title={`${video?.title ?? reference} | ${profile?.name || video?.ownerAddress}`}
        description={removeMarkdown(video?.description ?? "").replace(/\n/g, "")}
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
          owner={profile}
          sources={video?.sources ?? []}
          originalQuality={video?.originalQuality}
          thumbnailUrl={posterUrl}
          embed
        />
      ) : (
        <div className="mb-16">
          <Container fluid align="center" noPaddingX noPaddingY>
            <div className="col lg:w-3/4">
              <Player
                hash={reference}
                title={video?.title || reference}
                owner={profile}
                sources={video?.sources ?? []}
                originalQuality={video?.originalQuality}
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

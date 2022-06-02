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

import React from "react"
import { useParams } from "react-router-dom"

import Container from "@/components/common/Container"
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper"
import SEO from "@/components/layout/SEO"
import VideoView from "@/components/video/VideoView"
import useRouteState from "@/hooks/useRouteState"
import type { Video, VideoOffersStatus } from "@/definitions/swarm-video"

const WatchPage = () => {
  const { hash } = useParams()
  const routeState = useRouteState<{ video: Video, videoOffers: VideoOffersStatus }>()

  if (!hash) return null

  return (
    <AppLayoutWrapper hideSidebar floatingSidebar>
      <SEO title="Watch" />

      <Container noPaddingY>
        <VideoView reference={hash} routeState={routeState} />
      </Container>
    </AppLayoutWrapper>
  )
}

export default WatchPage

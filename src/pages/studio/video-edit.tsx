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
import VideoEdit from "@/components/studio/VideoEdit"
import useRouteState from "@/hooks/useRouteState"
import type { Video } from "@/definitions/swarm-video"

const StudioVideoEdit = () => {
  const params = useParams<{ id: string }>()
  const hash = params.id !== "new" ? params.id : undefined
  const routeState = useRouteState<{ video: Video, hasOffers: boolean }>()

  return (
    <AppLayoutWrapper floatingSidebar hideSidebar>
      <Container noPaddingX noPaddingY>
        <VideoEdit reference={hash} routeState={routeState} />
      </Container>
    </AppLayoutWrapper>
  )
}

export default StudioVideoEdit

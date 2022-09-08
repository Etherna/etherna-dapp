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

import ComingSoon from "@/components/common/ComingSoon"
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper"
import SEO from "@/components/layout/SEO"
import { Container } from "@/components/ui/layout"

const HomePage = () => (
  <AppLayoutWrapper>
    <SEO title="Frames" description="Explore all the communities... frame to frame!" />
    <Container fluid>
      <ComingSoon
        description={`A frame is a container of contents managed by the community.
        It has specific logic and dynamics for is moderation and on how users interact with it.
        Content is displayed inside it with an ordered list, and the order can be selected in different ways.
        These ways can be determined by index, or in future could be choose directly by client implementing itself.
        Frames can be removed by super moderators of Index,
        but any discussion between moderators and index administrators must be in clear and permanent on Swarm.
        This will make anything transparent, and can create a “funny” archive of creepy history contents.`}
      />
    </Container>
  </AppLayoutWrapper>
)

export default HomePage

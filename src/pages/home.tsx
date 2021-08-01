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

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ExploreView from "@components/video/ExploreView"

const HomePage = () => (
  <AppLayoutWrapper>
    <SEO
      title="Etherna"
      tagline="A transparent video platform"
      description="A transparent video platform"
    />
    <Container>
      <ExploreView />
    </Container>
  </AppLayoutWrapper>
)

export default HomePage

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
import ComingSoon from "@common/ComingSoon"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"

const HomePage = () => (
  <AppLayoutWrapper>
    <SEO
      title="Playlists"
    />
    <Container fluid>
      <ComingSoon
        description={`Here you'll be able to create your own playlist.
        Playlists are collections of videos that you can save as you prefer to keep your favorite
        videos organized in categories.`}
      />
    </Container>
  </AppLayoutWrapper>
)

export default HomePage

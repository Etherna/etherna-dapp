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
import { useLocation } from "react-router-dom"

import Container from "@/components/common/Container"
import ComingSoon from "@/components/common/ComingSoon"
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper"
import SEO from "@/components/layout/SEO"

const SearchPage = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const query = params.get("q") ?? ""

  return (
    <AppLayoutWrapper>
      <SEO title={`Search: ${query}`} />

      <Container fluid>
        <h1>Search: {query}</h1>
        <ComingSoon
          description={`Search any video, frame and user`}
        />
      </Container>
    </AppLayoutWrapper>
  )
}

export default SearchPage

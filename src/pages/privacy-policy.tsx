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

import React, { useEffect } from "react"

import Container from "@/components/common/Container"
import AppLayoutWrapper from "@/components/layout/AppLayoutWrapper"
import SEO from "@/components/layout/SEO"

import "@/styles/overrides/iubenda.scss"

const PrivacyPolicyPage = () => {
  useEffect(() => {
    const iubendaScript = document.createElement("script")
    iubendaScript.src = "https://cdn.iubenda.com/iubenda.js"

    const tag = document.getElementsByTagName("script")[0]
    tag.parentNode!.insertBefore(iubendaScript, tag)

    return () => {
      iubendaScript.remove()
    }
  }, [])

  return (
    <AppLayoutWrapper>
      <SEO title="Privacy Policy" />

      <Container fluid>
        <a
          href="https://www.iubenda.com/privacy-policy/57423156"
          className="iubenda-embed iub-body-embed"
          title="Privacy Policy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
      </Container>
    </AppLayoutWrapper>
  )
}

export default PrivacyPolicyPage

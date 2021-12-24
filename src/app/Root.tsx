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
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"

import "@styles/theme.scss"

import Router from "./Router"
import AppLayout from "@components/layout/AppLayout"
import ShortcutWrapper from "@keyboard/shortcutWrapper"
import StateProviderWrapper from "@state/StateProviderWrapper"
import useAutoSignin from "@state/hooks/user/useAutoSignin"
import { getBasename } from "@routes"

const Root: React.FC = () => {
  useAutoSignin({
    isStatusPage: /^\/404/.test(window.location.pathname)
  })

  return (
    <BrowserRouter basename={getBasename()}>
      <HelmetProvider context={{}}>
        <AppLayout>
          <Router />
        </AppLayout>
      </HelmetProvider>
    </BrowserRouter>
  )
}

const StateRoot: React.FC = () => (
  <StateProviderWrapper>
    <ShortcutWrapper>
      <Root />
    </ShortcutWrapper>
  </StateProviderWrapper>
)

export default StateRoot

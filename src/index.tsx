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
import ReactDOM from "react-dom/client"
import { urlOrigin } from "@etherna/sdk-js/utils"

import Root from "./app/Root"
import prefetch from "./prefetch"
import { getBasename } from "./routes"
import unsupportedRender from "./unsupported-render"
import { autoRedirect } from "./utils/automations"
import { getAccessToken } from "./utils/jwt"
import { registerSW } from "./utils/workers"

// Automatically redirect from www to non-www
autoRedirect()

// Prefetch data for SEO
// Once the data has been set to a window variable call RenderDOM
prefetch(() => {
  const root = ReactDOM.createRoot(document.getElementById("root")!)
  root.render(<Root />)
})

// Check if the current browser has unsupported features
// and show a notification modal.
unsupportedRender(async () => {
  const RootLegacy = (await import("./app/RootLegacy")).default
  const root = ReactDOM.createRoot(document.getElementById("root_legacy")!)
  root.render(<RootLegacy />)
})

// Register service workers
registerSW(getBasename() + "/fetch-sw.js", () => {
  navigator.serviceWorker.controller!.postMessage(JSON.stringify({ accessToken: getAccessToken() }))
  navigator.serviceWorker.controller!.postMessage(
    JSON.stringify({
      allowedOrigins: [
        urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL),
        import.meta.env.VITE_APP_MATOMO_URL ? urlOrigin(import.meta.env.VITE_APP_MATOMO_URL) : null,
      ].filter(Boolean),
    })
  )
})

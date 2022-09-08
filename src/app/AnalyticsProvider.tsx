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
import { MatomoProvider, createInstance } from "@datapunt/matomo-tracker-react"

const MatomoProviderFix = MatomoProvider as React.FC<any>

const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (import.meta.env.VITE_APP_MATOMO_URL && import.meta.env.VITE_APP_MATOMO_SITE_ID) {
    const instance = createInstance({
      urlBase: import.meta.env.VITE_APP_MATOMO_URL,
      siteId: import.meta.env.VITE_APP_MATOMO_SITE_ID,
      disabled: false,
      linkTracking: false,
      configurations: {
        disableCookies: true,
      },
    })

    return <MatomoProviderFix value={instance}>{children}</MatomoProviderFix>
  }

  return <>{children}</>
}

export default AnalyticsProvider

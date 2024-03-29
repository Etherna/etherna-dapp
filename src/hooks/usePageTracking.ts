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
 */

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

import { useAnalytics } from "@/packages/analytics"

export default function usePageTracking() {
  const { pathname, search } = useLocation()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView({
      documentTitle: document.title,
      href: `${location.origin}/${location.pathname}${location.search}`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search])
}

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

import { useEffect, useState } from "react"

import useUIStore from "@/stores/ui"

export default function useSidebar() {
  const floatingSidebar = useUIStore(state => state.floatingSidebar)
  const [sidebarWidth, setSidebarWidth] = useState<number>()

  useEffect(() => {
    function resize() {
      setSidebarWidth(sidebar.clientWidth)
    }

    const sidebar = document.querySelector("[data-sidebar]")!
    if (sidebar) {
      setSidebarWidth(sidebar.clientWidth)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(sidebar)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return {
    sidebarWidth: floatingSidebar ? 0 : sidebarWidth,
  }
}

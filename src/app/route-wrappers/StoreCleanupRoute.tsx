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
import { Outlet, useLocation } from "react-router-dom"

import routes from "@/routes"
import videoEditorStore from "@/stores/video-editor"

const StoreCleanupRoute: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    const newVideoRegex = new RegExp(routes.studioVideoNew)
    const editVideoRegex = new RegExp(routes.studioVideoEdit(":id").replace(":id", "(.*)"))
    if (![newVideoRegex, editVideoRegex].some(regex => regex.test(location.pathname))) {
      import.meta.env.DEV && console.info("cleaning video editor store")
      videoEditorStore.getState().reset()
      videoEditorStore.persist.clearStorage()
    }
  }, [location])

  return <Outlet />
}

export default StoreCleanupRoute

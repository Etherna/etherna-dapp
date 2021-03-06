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

import { lazy, Suspense } from "react"
import { Switch, Route, useLocation } from "react-router-dom"

import { ProfileOwnerRoute, SignedInRoute, WatchRoute } from "./ProtectedRoutes"

const AsyncHome = lazy(() => import("@pages/home"))
const AsyncProfile = lazy(() => import("@pages/profile"))
const AsyncProfileEdit = lazy(() => import("@pages/profileEdit"))
const AsyncProfiles = lazy(() => import("@pages/profiles"))
const AsyncWatch = lazy(() => import("@pages/watch"))
const AsyncVideoSettings = lazy(() => import("@pages/videoSettings"))
const AsyncUpload = lazy(() => import("@pages/upload"))
const AsyncShortcuts = lazy(() => import("@pages/shortcuts"))
const AsyncNotFound = lazy(() => import("@pages/404"))

const Home = () => (
  <Suspense fallback={null}><AsyncHome /></Suspense>
)
const Profile = () => (
  <Suspense fallback={null}><AsyncProfile /></Suspense>
)
const ProfileEdit = () => (
  <Suspense fallback={null}><AsyncProfileEdit /></Suspense>
)
const Profiles = () => (
  <Suspense fallback={null}><AsyncProfiles /></Suspense>
)
const Watch = () => (
  <Suspense fallback={null}><AsyncWatch /></Suspense>
)
const VideoSettings = () => (
  <Suspense fallback={null}><AsyncVideoSettings /></Suspense>
)
const Upload = () => (
  <Suspense fallback={null}><AsyncUpload /></Suspense>
)
const Shortcuts = () => (
  <Suspense fallback={null}><AsyncShortcuts /></Suspense>
)
const NotFound = () => (
  <Suspense fallback={null}><AsyncNotFound /></Suspense>
)

type RouterLocation = ReturnType<typeof useLocation>

const Router = () => {
  const location = useLocation<{ background: RouterLocation }>()
  const background = location.state?.background

  return (
    <>
      <Switch location={background || location}>
        <Route path={"/"} exact>
          <Home />
        </Route>
        <Route path={"/profiles"} exact>
          <Profiles />
        </Route>
        <Route path={"/profile/:id"} exact>
          <Profile />
        </Route>
        <ProfileOwnerRoute path={"/profile/:id/edit"} exact>
          <ProfileEdit />
        </ProfileOwnerRoute>
        <WatchRoute path={"/watch"}>
          <Watch />
        </WatchRoute>
        <SignedInRoute path={"/videoSettings"}>
          <VideoSettings />
        </SignedInRoute>
        <SignedInRoute path={"/upload"}>
          <Upload />
        </SignedInRoute>
        <Route path={"/shortcuts"}>
          <Shortcuts />
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>

      {/* mini player */}
      {background && (
        <WatchRoute path={"/watch"}>
          <div className="todo-mini-player-wrapper">
            <Watch />
          </div>
        </WatchRoute>
      )}
    </>
  )
}

export default Router

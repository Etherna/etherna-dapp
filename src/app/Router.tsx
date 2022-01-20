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

import StudioLayout from "@components/layout/StudioLayout"
import React, { lazy, Suspense } from "react"
import { Switch, Route, useLocation } from "react-router-dom"

import { SignedInRoute, WatchRoute } from "./ProtectedRoutes"

const AsyncHome = lazy(() => import("@pages/home"))
const AsyncFrames = lazy(() => import("@pages/frames"))
const AsyncFollowing = lazy(() => import("@pages/following"))
const AsyncPlaylists = lazy(() => import("@pages/playlists"))
const AsyncSaved = lazy(() => import("@pages/saved"))
const AsyncProfile = lazy(() => import("@pages/profile"))
const AsyncStudio = lazy(() => import("@pages/studio/creator-studio"))
const AsyncProfileEdit = lazy(() => import("@pages/studio/channel-editor"))
const AsyncVideoEdit = lazy(() => import("@pages/studio/video-edit"))
const AsyncProfiles = lazy(() => import("@pages/profiles"))
const AsyncWatch = lazy(() => import("@pages/watch"))
const AsyncSearch = lazy(() => import("@pages/search"))
const AsyncShortcuts = lazy(() => import("@pages/shortcuts"))
const AsyncNotFound = lazy(() => import("@pages/404"))

const Home = () => (
  <Suspense fallback={null}><AsyncHome /></Suspense>
)
const Frames = () => (
  <Suspense fallback={null}><AsyncFrames /></Suspense>
)
const Following = () => (
  <Suspense fallback={null}><AsyncFollowing /></Suspense>
)
const Playlists = () => (
  <Suspense fallback={null}><AsyncPlaylists /></Suspense>
)
const Saved = () => (
  <Suspense fallback={null}><AsyncSaved /></Suspense>
)
const Profile = () => (
  <Suspense fallback={null}><AsyncProfile /></Suspense>
)
const Profiles = () => (
  <Suspense fallback={null}><AsyncProfiles /></Suspense>
)
const Watch = () => (
  <Suspense fallback={null}><AsyncWatch /></Suspense>
)
const Studio = () => (
  <Suspense fallback={null}><AsyncStudio /></Suspense>
)
const ProfileEdit = () => (
  <Suspense fallback={null}><AsyncProfileEdit /></Suspense>
)
const VideoEdit = () => (
  <Suspense fallback={null}><AsyncVideoEdit /></Suspense>
)
const Shortcuts = () => (
  <Suspense fallback={null}><AsyncShortcuts /></Suspense>
)
const Search = () => (
  <Suspense fallback={null}><AsyncSearch /></Suspense>
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
        <Route path={"/frames"} exact>
          <Frames />
        </Route>
        <Route path={"/following"} exact>
          <Following />
        </Route>
        <Route path={"/playlists"} exact>
          <Playlists />
        </Route>
        <Route path={"/saved"} exact>
          <Saved />
        </Route>
        <Route path={"/profiles"} exact>
          <Profiles />
        </Route>
        <Route path={"/profile/:id"} exact>
          <Profile />
        </Route>
        <WatchRoute path={"/watch"}>
          <Watch />
        </WatchRoute>
        <Route path={"/search"}>
          <Search />
        </Route>
        <Route path={"/shortcuts"}>
          <Shortcuts />
        </Route>

        <StudioLayout>
          <SignedInRoute path={"/studio"} exact>
            <Studio />
          </SignedInRoute>
          <SignedInRoute path={"/studio/channel"} exact>
            <ProfileEdit />
          </SignedInRoute>
          <SignedInRoute path={"/studio/videos/:id"} exact>
            <VideoEdit />
          </SignedInRoute>
        </StudioLayout>

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

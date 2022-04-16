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

import React, { lazy, Suspense } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"

import AppLayoutRoute from "./route-wrappers/AppLayoutRoute"
import PWARoute from "./route-wrappers/PWARoute"
import StudioLayoutRoute from "./route-wrappers/StudioLayoutRoute"
import StateProviderRoute from "./route-wrappers/StateProviderRoute"
import AuthenticateRoute from "./route-wrappers/AuthenticateRoute"
import SignedInRoute from "./route-wrappers/SignedInRoute"
import VideoRoute from "./route-wrappers/VideoRoute"

const AsyncHome = lazy(() => import("@pages/home"))
const AsyncFrames = lazy(() => import("@pages/frames"))
const AsyncFollowing = lazy(() => import("@pages/following"))
const AsyncPlaylists = lazy(() => import("@pages/playlists"))
const AsyncSaved = lazy(() => import("@pages/saved"))
const AsyncChannel = lazy(() => import("@pages/channel"))
const AsyncChannelEdit = lazy(() => import("@pages/studio/channel-edit"))
const AsyncVideosList = lazy(() => import("@pages/studio/videos-list"))
const AsyncVideoEdit = lazy(() => import("@pages/studio/video-edit"))
const AsyncStorage = lazy(() => import("@pages/studio/storage"))
const AsyncProfiles = lazy(() => import("@pages/profiles"))
const AsyncWatch = lazy(() => import("@pages/watch"))
const AsyncEmbed = lazy(() => import("@pages/embed"))
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
const Channel = () => (
  <Suspense fallback={null}><AsyncChannel /></Suspense>
)
const Profiles = () => (
  <Suspense fallback={null}><AsyncProfiles /></Suspense>
)
const Watch = () => (
  <Suspense fallback={null}><AsyncWatch /></Suspense>
)
const Embed = () => (
  <Suspense fallback={null}><AsyncEmbed /></Suspense>
)
const ChannelEdit = () => (
  <Suspense fallback={null}><AsyncChannelEdit /></Suspense>
)
const VideosList = () => (
  <Suspense fallback={null}><AsyncVideosList /></Suspense>
)
const VideoEdit = () => (
  <Suspense fallback={null}><AsyncVideoEdit /></Suspense>
)
const Storage = () => (
  <Suspense fallback={null}><AsyncStorage /></Suspense>
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

const Router = () => {
  const location = useLocation() as any
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <>
      <Routes location={backgroundLocation || location}>

        <Route path="" element={<StateProviderRoute />}>
          <Route path="" element={<PWARoute />}>
            <Route path="/" element={<AuthenticateRoute />}>
              <Route path="/" element={<AppLayoutRoute />}>

                <Route path="/" element={<Home />} />
                <Route path="/frames" element={<Frames />} />
                <Route path="/following" element={<Following />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/channel/:id" element={<Channel />} />
                <Route path="/search" element={<Search />} />
                <Route path="/shortcuts" element={<Shortcuts />} />

                <Route path="/watch" element={<VideoRoute />}>
                  <Route path=":hash" element={<Watch />} />
                </Route>

                <Route path="/studio" element={<SignedInRoute />}>
                  <Route path="" element={<StudioLayoutRoute />}>
                    <Route path="" element={<Navigate replace to="/studio/videos" />} />
                    <Route path="channel" element={<ChannelEdit />} />
                    <Route path="videos" element={<VideosList />} />
                    <Route path="videos/:id" element={<VideoEdit />} />
                    <Route path="storage" element={<Storage />} />
                  </Route>
                </Route>

              </Route>
            </Route>

            <Route path="/embed" element={<VideoRoute />}>
              <Route path=":hash" element={<Embed />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>

      {/* mini player */}
      {backgroundLocation && (
        <Routes>
          <Route
            path={"/watch"}
            element={
              <div className="todo-mini-player-wrapper">
                <Watch />
              </div>
            }
          />
        </Routes>
      )}
    </>
  )
}

export default Router

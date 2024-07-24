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
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import AppLayoutRoute from "./route-wrappers/AppLayoutRoute"
import AuthenticateRoute from "./route-wrappers/AuthenticateRoute"
import ChannelLayoutRoute from "./route-wrappers/ChannelLayoutRoute"
import DefaultBatchRoute from "./route-wrappers/DefaultBatchRoute"
import IdentityRoute from "./route-wrappers/IdentityRoute"
import SignedInRoute from "./route-wrappers/SignedInRoute"
import StoreCleanupRoute from "./route-wrappers/StoreCleanupRoute"
import StudioLayoutRoute from "./route-wrappers/StudioLayoutRoute"
import VideoRoute from "./route-wrappers/VideoRoute"
import { PageLoader } from "@/components/ui/layout"
import AlphaPassRedirect from "@/pages/alpha-pass"

const AsyncHome = lazy(() => import("@/pages/home"))
const AsyncFrames = lazy(() => import("@/pages/frames"))
const AsyncFollowing = lazy(() => import("@/pages/following"))
const AsyncPlaylists = lazy(() => import("@/pages/playlists"))
const AsyncPlaylist = lazy(() => import("@/pages/playlist"))
const AsyncSaved = lazy(() => import("@/pages/saved"))
const AsyncChannel = lazy(() => import("@/pages/channel/channel"))
const AsyncChannelIndexVideos = lazy(() => import("@/pages/channel/index-videos"))
const AsyncChannelPlaylistVideos = lazy(() => import("@/pages/channel/playlist-videos"))
const AsyncChannelEdit = lazy(() => import("@/pages/studio/channel-edit"))
const AsyncChannelPlaylists = lazy(() => import("@/pages/studio/channel-playlists"))
const AsyncVideosList = lazy(() => import("@/pages/studio/videos-list"))
const AsyncVideoEdit = lazy(() => import("@/pages/studio/video-edit"))
const AsyncWatch = lazy(() => import("@/pages/watch"))
const AsyncEmbed = lazy(() => import("@/pages/embed"))
const AsyncSearch = lazy(() => import("@/pages/search"))
const AsyncShortcuts = lazy(() => import("@/pages/shortcuts"))
const AsyncPostages = lazy(() => import("@/pages/postages"))
const AsyncPrivacyPolicy = lazy(() => import("@/pages/privacy-policy"))
const AsyncNotFound = lazy(() => import("@/pages/404"))

const Home = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncHome />
  </Suspense>
)
const Frames = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncFrames />
  </Suspense>
)
const Following = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncFollowing />
  </Suspense>
)
const Playlists = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncPlaylists />
  </Suspense>
)
const Playlist = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncPlaylist />
  </Suspense>
)
const Saved = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncSaved />
  </Suspense>
)
const Channel = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncChannel />
  </Suspense>
)
const ChannelIndexVideos = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncChannelIndexVideos />
  </Suspense>
)
const ChannelPlaylistVideos = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncChannelPlaylistVideos />
  </Suspense>
)
const Watch = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncWatch />
  </Suspense>
)
const Embed = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncEmbed />
  </Suspense>
)
const ChannelEdit = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncChannelEdit />
  </Suspense>
)
const ChannelPlaylists = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncChannelPlaylists />
  </Suspense>
)
const VideosList = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncVideosList />
  </Suspense>
)
const VideoEdit = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncVideoEdit />
  </Suspense>
)
const Shortcuts = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncShortcuts />
  </Suspense>
)
const Postages = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncPostages />
  </Suspense>
)
const Search = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncSearch />
  </Suspense>
)
const PrivacyPolicy = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncPrivacyPolicy />
  </Suspense>
)
const NotFound = () => (
  <Suspense fallback={<PageLoader />}>
    <AsyncNotFound />
  </Suspense>
)

const Callback = () => {
  return null
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    },
  },
})

const Router = () => {
  const location = useLocation() as any
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <QueryClientProvider client={queryClient}>
      <Routes location={backgroundLocation || location}>
        <Route path="" element={<IdentityRoute />}>
          <Route path="" element={<StoreCleanupRoute />}>
            <Route path="" element={<AuthenticateRoute />}>
              <Route path="" element={<AppLayoutRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/request-alpha-pass" element={<AlphaPassRedirect />} />
                <Route path="/frames" element={<Frames />} />
                <Route path="/following" element={<Following />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlists/:hash" element={<Playlist />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/search" element={<Search />} />
                <Route path="/shortcuts" element={<Shortcuts />} />
                <Route path="/postages" element={<Postages />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                <Route path="/channel/:id" element={<ChannelLayoutRoute />}>
                  <Route path="" element={<Channel />} />
                  <Route path="index/:host" element={<ChannelIndexVideos />} />
                  <Route path="playlist/:playlist" element={<ChannelPlaylistVideos />} />
                </Route>

                <Route path="/watch" element={<VideoRoute />}>
                  <Route path=":hash" element={<Watch />} />
                </Route>

                <Route path="/studio" element={<SignedInRoute />}>
                  <Route path="" element={<StudioLayoutRoute />}>
                    <Route path="" element={<Navigate replace to="/studio/videos" />} />
                    <Route path="" element={<DefaultBatchRoute />}>
                      <Route path="videos" element={<VideosList />} />
                      <Route path="videos/:id" element={<VideoEdit />} />
                      <Route path="channel" element={<ChannelEdit />} />
                      <Route path="playlists" element={<ChannelPlaylists />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="/embed" element={<VideoRoute />}>
          <Route path=":hash" element={<Embed />} />
        </Route>

        <Route path="*" element={<NotFound />} />
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
    </QueryClientProvider>
  )
}

export default Router

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

const routePaths = {
  /** `/` */
  home: `/`,
  /** `/frames` */
  frames: `/frames`,
  /** `/frames/{id}` */
  frame: (id: string) => `/frames/${id}`,
  /** `/following` */
  following: `/following`,
  /** `/saved` */
  saved: `/saved`,
  /** `/playlists` */
  playlists: `/playlists`,
  /** `/channels/{id}` */
  channel: (id: string) => `/channel/${id}`,
  /** `/watch/{hash}` */
  watch: (hash: string) => `/watch/${hash}`,
  /** `/embed/{hash}` */
  embed: (hash: string) => `/embed/${hash}`,
  /** `/search?q={query}` */
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  /** `/request-alpha-pass` */
  alphaPasss: `/request-alpha-pass`,
  /** `/shortcuts` */
  shortcuts: `/shortcuts`,
  /** `/postages` */
  postages: `/postages`,
  /** `/privacy-policy` */
  privacyPolicy: `/privacy-policy`,
  /** `/studio` */
  studio: `/studio`,
  /** `/studio/videos` */
  studioVideos: `/studio/videos`,
  /** `/studio/videos/{id}` */
  studioVideoEdit: (id: string) => `/studio/videos/${id}`,
  /** `/studio/videos/new` */
  studioVideoNew: `/studio/videos/new`,
  /** `/studio/channel` */
  studioChannel: `/studio/channel`,
  /** `/studio/postages` */
  studioPostages: `/studio/postages`,
} as const

const withOrigin = (paths: typeof routePaths): typeof routePaths => {
  const routeNames = Object.keys(paths) as (keyof typeof routePaths)[]
  const withOriginRoutes = routeNames.reduce(
    (acc, routeName) => {
      const routePath = paths[routeName]
      return {
        ...acc,
        [routeName]:
          typeof routePath === "string"
            ? `${window.location.origin}${paths[routeName]}`
            : (...args: any[]) => `${window.location.origin}${routePath(args as any)}`,
      }
    },
    {} as typeof routePaths
  )
  return withOriginRoutes
}

const routes = {
  ...routePaths,
  withOrigin: withOrigin(routePaths),
}

export default routes

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

const routes = {
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
  channel: (id: string) => `/channels/${id}`,
  /** `/watch/{hash}` */
  watch: (hash: string) => `/watch/${hash}`,
  /** `/embed/{hash}` */
  embed: (hash: string) => `/embed/${hash}`,
  /** `/search?q={query}` */
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  /** `/shortcuts` */
  shortcuts: `/shortcuts`,
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
  /** `/studio/storage` */
  studioStorage: `/studio/storage`,
}

export default routes

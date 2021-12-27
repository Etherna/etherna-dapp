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

/**
 * Home route
 */
export const getHomeLink = () => {
  return `/`
}

/**
 * Frames routes
 */
export const getFramesLink = () => {
  return `/frames`
}

/**
 * User routes
 */
export const getProfilesLink = () => {
  return `/profiles`
}

export const getFollowingLink = () => {
  return `/following`
}

export const getSavedLink = () => {
  return `/saved`
}

export const getPlaylistsLink = () => {
  return `/playlists`
}

export const getProfileLink = (hash: string) => {
  return `/profile/${encodeURIComponent(hash)}`
}

export const getProfileEditingLink = (hash: string) => {
  return `/profile/${encodeURIComponent(hash)}/edit`
}

export const getSearchLink = (query: string) => {
  return `/search?q=${encodeURIComponent(query)}`
}

/**
 * Video routes
 */
export const getVideoLink = (hash: string, sourcePath?: string) => {
  return `/watch?v=${hash}${encodeURIComponent(sourcePath ? `/${sourcePath}` : ``)}`
}

export const getVideoSettingsLink = (hash: string) => {
  return `/videoSettings?v=${encodeURIComponent(hash)}`
}

/**
 * Static routes
 */
export const getVideoUploadLink = () => {
  return `/upload`
}
export const getHowItWorksLink = () => {
  return `/how-it-works`
}
export const getShortcutsLink = () => {
  return `/shortcuts`
}
export const getPrivacyPolicyLink = () => {
  return `/privacy-policy`
}

/**
 * Fallback routes
 */
export const getNotFoundLink = () => {
  return `/notfound`
}

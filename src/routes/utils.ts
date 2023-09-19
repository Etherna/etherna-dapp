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

export const getBasename = () => {
  const bzzPattern = /\/bzz\/([^/]+)/
  const basename = bzzPattern.test(window.location.pathname)
    ? window.location.pathname.match(bzzPattern)![0]
    : ""
  return basename
}

export const getBaseOrigin = () => {
  const origin = window.location.origin
  const basename = getBasename()
  return `${origin}${basename}`
}

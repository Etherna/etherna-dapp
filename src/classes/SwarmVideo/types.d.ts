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

import { Canceler } from "axios"

export type SwarmVideoDownloadOptions = {
  /** If true will download the video even with prefetched data (default = false) */
  forced?: boolean
  /** By default true, set to false to avoid fetchsing the profile */
  fetchProfile?: boolean
}

export type SwarmVideoUploadOptions = {
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}

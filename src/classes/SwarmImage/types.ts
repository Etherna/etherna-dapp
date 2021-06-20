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

export type SwarmImageRaw = {
  /**  Resource type */
  "@type": "image" | "responsiveImage"
  /**  hash/<path?> of the original image */
  value: string
  /** array containing the width and height of the original image */
  originalSize?: [width: number, height: number]
  /** Blurred & Low resolution base64 of the original image  */
  blurredBase64?: string
  /**  Responsive images references (only for @type = 'responsiveImage') */
  sources?: {
    [size: string]: string
  }
}

export type SwarmImageUploadOptions = {
  reference?: string
  path?: string
  onUploadProgress?: (progress: number) => void
  onCancelToken?: (canceler: Canceler) => void
}

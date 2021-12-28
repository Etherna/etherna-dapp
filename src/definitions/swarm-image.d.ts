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

export type SwarmImageRaw = {
  /** Image aspect ratio (width / height) */
  aspectRatio: number
  /** Blurhash value  */
  blurhash: string
  /** Sources of image in different resolutions */
  sources: {
    [size: `${number}w`]: string
  }
}

export type SwarmImage = SwarmImageRaw & {
  /** Data URL of the blur-hash  */
  blurredBase64: string
  /** img src url */
  src: string
  /** img srcset urls */
  srcset?: string
}

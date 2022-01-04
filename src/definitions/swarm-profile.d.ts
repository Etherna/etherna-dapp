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

import type { SwarmImage, SwarmImageRaw } from "./swarm-image"

export type ProfileRaw = {
  /**  Profile address */
  address: string
  /**  Name of the Profile */
  name: string | null
  /**  Description of the Profile */
  description?: string | null
  /**  User's raw avatar image */
  avatar: SwarmImageRaw | null
  /**  User's raw cover image */
  cover: SwarmImageRaw | null
  /** User's location */
  location?: string
  /** User's website */
  website?: string
  /** User's birthday */
  birthday?: string
}

export type Profile = {
  /**  Profile address */
  address: string
  /**  Name of the Profile */
  name: string | null
  /**  Description of the Profile */
  description: string | null
  /**  User's avatar */
  avatar: SwarmImage | null
  /**  User's cover */
  cover: SwarmImage | null
  /** User's location */
  location?: string
  /** User's website */
  website?: string
  /** User's birthday */
  birthday?: string
}

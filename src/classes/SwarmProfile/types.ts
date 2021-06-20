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

import SwarmImage from "@classes/SwarmImage"
import { SwarmImageRaw } from "@classes/SwarmImage/types"

export type Profile = {
  /**  Profile address */
  address: string
  /**  Swarm manifest hash */
  manifest?: string
  /**  Name of the Profile */
  name: string|null
  /**  Description of the Profile */
  description?: string|null
  /**  User's avatar */
  avatar?: SwarmImage
  /**  User's cover */
  cover?: SwarmImage
  /** User's location */
  location?: string
  /** User's website */
  website?: string
  /** User's birthday */
  birthday?: string
}

export type ProfileRaw = Omit<Profile, "avatar" | "cover"> & {
  /**  User's raw avatar image */
  avatar?: SwarmImageRaw
  /**  User's raw cover image */
  cover?: SwarmImageRaw
}

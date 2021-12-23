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

import type { ProfileState } from "@definitions/app-state"
import type { SwarmImage } from "@definitions/swarm-image"

export const ProfileActionTypes = {
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PROFILE_SAVE: "PROFILE_SAVE",
  PROFILE_SIGNOUT: "PROFILE_SIGNOUT",
} as const

// Export dispatch actions
type UpdateProfileAction = {
  type: typeof ProfileActionTypes.PROFILE_UPDATE
  name: string
  description: string
  avatar: SwarmImage | null
  cover: SwarmImage | null
  location?: string
  website?: string
  birthday?: string
  existsOnIndex: boolean
}
type SaveProfileAction = {
  type: typeof ProfileActionTypes.PROFILE_SAVE
  name: string
  description: string
  avatar?: SwarmImage | null
  cover?: SwarmImage | null
}
type SignoutAction = {
  type: typeof ProfileActionTypes.PROFILE_SIGNOUT
}

export type ProfileActions = (
  UpdateProfileAction |
  SaveProfileAction |
  SignoutAction
)


// Init reducer
const profileReducer = (state: ProfileState = {}, action: ProfileActions): ProfileState => {
  switch (action.type) {
    case ProfileActionTypes.PROFILE_UPDATE:
      return {
        ...state,
        name: action.name,
        description: action.description,
        avatar: action.avatar,
        cover: action.cover,
        location: action.location,
        website: action.website,
        birthday: action.birthday,
        existsOnIndex: action.existsOnIndex,
      }

    case ProfileActionTypes.PROFILE_SAVE:
      return {
        ...state,
        name: action.name,
        description: action.description,
        avatar: action.avatar,
        cover: action.cover,
      }

    case ProfileActionTypes.PROFILE_SIGNOUT:
      return {}

    default:
      return state
  }
}

export default profileReducer

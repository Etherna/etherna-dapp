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

import { Dispatch } from "redux"
import { useDispatch } from "react-redux"

import { ProfileActions, ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActions, UserActionTypes } from "@state/reducers/userReducer"
import useSelector from "@state/useSelector"
import type { Profile } from "@definitions/swarm-profile"

export default function useProfileUpdate(address: string) {
  const dispatch = useDispatch<Dispatch<ProfileActions | UserActions>>()
  const { prevAddresses } = useSelector(state => state.user)

  const updateProfile = async (reference: string, profile: Profile) => {
    dispatch({
      type: ProfileActionTypes.PROFILE_SAVE,
      name: profile.name ?? "",
      description: profile.description ?? "",
      avatar: profile.avatar,
      cover: profile.cover,
    })
    dispatch({
      type: UserActionTypes.USER_UPDATE_IDENTITY,
      address,
      prevAddresses,
      manifest: reference
    })
  }

  return updateProfile
}


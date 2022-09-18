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

import type { EthAddress } from "@/classes/BeeClient/types"
import SwarmProfile from "@/classes/SwarmProfile"
import { ProfileActionTypes } from "@/state/reducers/profileReducer"
import { UIActionTypes } from "@/state/reducers/uiReducer"
import { store } from "@/state/store"

/**
 * Fetch profile info
 *
 * @param hash Manifest hash with profile data
 * @param address Profile address
 */
const fetchProfile = async (hash: string, address: EthAddress) => {
  store.dispatch({
    type: UIActionTypes.TOGGLE_LOADING_PROFILE,
    isLoadingProfile: true,
  })

  try {
    const { beeClient } = store.getState().env
    const profileReader = new SwarmProfile.Reader(address, { beeClient })
    const profile = await profileReader.download()

    if (!profile) throw new Error("Cannot fetch profile")

    store.dispatch({
      type: ProfileActionTypes.PROFILE_UPDATE,
      name: profile.name ?? "",
      description: profile.description ?? "",
      avatar: profile.avatar,
      cover: profile.cover,
      location: profile.location,
      website: profile.website,
      birthday: profile.birthday,
      existsOnIndex: true,
    })
  } catch (error: any) {
    console.error(error)
  }

  store.dispatch({
    type: UIActionTypes.TOGGLE_LOADING_PROFILE,
    isLoadingProfile: false,
  })
}

export default fetchProfile

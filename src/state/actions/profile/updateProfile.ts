import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActionTypes } from "@state/reducers/userReducer"

import { Profile } from "@classes/SwarmProfile/types"
import SwarmProfile from "@classes/SwarmProfile"

const updateProfile = async (profile: Profile) => {
  const { beeClient, indexClient } = store.getState().env
  const { address, prevAddresses } = store.getState().user

  const profileHandler = new SwarmProfile({
    beeClient,
    address: profile.address,
    fetchFromCache: false
  })
  const manifest = await profileHandler.updateProfile(profile)
  await indexClient.users.updateCurrentUser(manifest)

  store.dispatch({
    type: ProfileActionTypes.PROFILE_SAVE,
    name: profile.name || "",
    description: profile.description || "",
    avatar: profile.avatar,
    cover: profile.cover,
  })
  store.dispatch({
    type: UserActionTypes.USER_UPDATE_IDENTITY,
    address,
    prevAddresses,
    manifest
  })
}

export default updateProfile

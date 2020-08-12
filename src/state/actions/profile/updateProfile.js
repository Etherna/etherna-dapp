import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActionTypes } from "@state/reducers/userReducer"

import { updateProfile as updateSwarmProfile, resolveImage } from "@utils/swarmProfile"

const updateProfile = async profile => {
  const { indexClient } = store.getState().env
  const { address, prevAddresses } = store.getState().user

  const manifest = await updateSwarmProfile(profile)
  await indexClient.users.updateCurrentUser(manifest)

  store.dispatch({
    type: ProfileActionTypes.PROFILE_SAVE,
    name: profile.name,
    description: profile.description,
    avatar: resolveImage(profile.avatar),
    cover: resolveImage(profile.cover),
  })
  store.dispatch({
    type: UserActionTypes.USER_UPDATE_IDENTITY,
    address,
    prevAddresses,
    manifest
  })
}

export default updateProfile

import { Dispatch } from "redux"
import { useDispatch } from "react-redux"

import { Profile } from "@classes/SwarmProfile/types"
import useSwarmProfile from "@hooks/useSwarmProfile"
import { ProfileActions, ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActions, UserActionTypes } from "@state/reducers/userReducer"
import useSelector from "@state/useSelector"

const useProfileUpdate = (address: string) => {
  const dispatch = useDispatch<Dispatch<ProfileActions | UserActions>>()
  const { prevAddresses } = useSelector(state => state.user)
  const { updateProfile: updateSwarmProfile } = useSwarmProfile({ address })

  const updateProfile = async (profile: Profile) => {
    const newReference = await updateSwarmProfile(profile)

    dispatch({
      type: ProfileActionTypes.PROFILE_SAVE,
      name: profile.name || "",
      description: profile.description || "",
      avatar: profile.avatar,
      cover: profile.cover,
    })
    dispatch({
      type: UserActionTypes.USER_UPDATE_IDENTITY,
      address,
      prevAddresses,
      manifest: newReference
    })
  }

  return updateProfile
}

export default useProfileUpdate

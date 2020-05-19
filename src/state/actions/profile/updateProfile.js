import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"

import { updateProfile as saveProfile } from "@utils/swarmProfile"

const updateProfile = async (profile) => {
    await saveProfile(profile)

    store.dispatch({
        type: ProfileActionTypes.PROFILE_SAVE,
        ...profile
    })
}

export default updateProfile

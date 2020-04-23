import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"

import { updateProfile as saveProfile } from "@utils/swarmProfile"

const updateProfile = async (profile) => {
    try {
        await saveProfile(profile)

        store.dispatch({
            type: ProfileActionTypes.PROFILE_SAVE,
            ...profile
        })

        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export default updateProfile

import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { getProfile } from "@utils/3box"

const fetchProfile = async address => {
    try {
        const boxProfile = await getProfile(address)

        store.dispatch({
            type: ProfileActionTypes.PROFILE_UPDATE,
            name: boxProfile.name,
            description: boxProfile.description,
            avatar: boxProfile.image,
            cover: boxProfile.coverPhoto,
            location: boxProfile.location,
            website: boxProfile.website,
            birthday: boxProfile.birthday,
        })
    } catch (error) {
        console.error(error)
    }
}

export default fetchProfile

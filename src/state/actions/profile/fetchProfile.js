import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { getProfile } from "@utils/3box"
import { getChannel } from "@utils/ethernaResources/channelResources"

const fetchProfile = async address => {
    try {
        const boxProfile = await getProfile(address)
        const profile = await getChannel(address)

        store.dispatch({
            type: ProfileActionTypes.PROFILE_UPDATE,
            name: boxProfile.name,
            description: boxProfile.description,
            avatar: boxProfile.avatar,
            cover: boxProfile.cover,
            location: boxProfile.location,
            website: boxProfile.website,
            birthday: boxProfile.birthday,
            existsOnIndex: profile !== null,
        })
    } catch (error) {
        console.error(error)
    }
}

export default fetchProfile

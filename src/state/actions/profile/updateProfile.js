import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { createChannel } from "@utils/ethernaResources/channelResources"

const updateProfile = async (box, data, existsOnIndex) => {
    try {
        const {
            address,
            name,
            description,
            image,
            coverPhoto
        } = data

        if (!existsOnIndex) {
            await createChannel(address)
        }

        const saved = await box.public.setMultiple([
            "name",
            "description",
            "image",
            "coverPhoto"
        ], [
            name,
            description,
            image,
            coverPhoto
        ])

        store.dispatch({
            type: ProfileActionTypes.PROFILE_UPDATE,
            name,
            description,
            avatar: image,
            cover: coverPhoto,
            existsOnIndex: true
        })

        return saved
    } catch (error) {
        console.error(error)
        return false
    }
}

export default updateProfile
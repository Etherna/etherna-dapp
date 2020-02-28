import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { createChannel } from "@utils/ethernaResources/channelResources"

const updateProfile = async (box, data, existsOnIndex) => {
    try {
        const { address, name, description, avatar, cover } = data

        const saved = await box.public.setMultiple(
            ["name", "description", "image", "coverPhoto"],
            [name, description, avatar, cover]
        )

        if (!saved) {
            return false
        }

        if (!existsOnIndex) {
            await createChannel(address)
        }

        store.dispatch({
            type: ProfileActionTypes.PROFILE_UPDATE,
            name,
            description,
            avatar,
            cover,
            existsOnIndex: true,
        })

        return saved
    } catch (error) {
        console.error(error)
        return false
    }
}

export default updateProfile

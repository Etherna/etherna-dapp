import { store } from "state/store"
import { ProfileActionTypes } from "state/reducers/profileReducer"

const updateProfile = async (box, data) => {
    try {
        const { name, description, avatar, cover } = data

        const saved = await box.public.setMultiple(
            ["name", "description", "image", "coverPhoto"],
            [name, description, avatar, cover]
        )

        if (!saved) {
            return false
        }

        store.dispatch({
            type: ProfileActionTypes.PROFILE_SAVE,
            name,
            description,
            avatar,
            cover,
        })

        return saved
    } catch (error) {
        console.error(error)
        return false
    }
}

export default updateProfile

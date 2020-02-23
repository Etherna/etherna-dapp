import Box from "3box"

export const getProfile = async address => {
    try {
        const boxProfile = await Box.getProfile(address)
        return boxProfile
    } catch (error) {
        console.error(error)
    }
}

export const updateProfile = async (box, data) => {
    try {
        const {
            name,
            description,
            image,
            coverPhoto
        } = data
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
        return saved
    } catch (error) {
        console.error(error)
        return false
    }
}

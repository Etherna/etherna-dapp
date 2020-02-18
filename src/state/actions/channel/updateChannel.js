import { store } from "../../store"

const updateChannel = async (name, description, avatar, cover) => {
    try {
        const ethernaSpace = await store.getState().profile.box.openSpace("ETHERNA");

        ethernaSpace.public.setMultiple([
            "channelName",
            "channelDescription",
            "channelAvatar",
            "channelCover",
        ], [
            name,
            description,
            avatar,
            cover
        ])

        store.dispatch({
            type: "MY_CHANNEL_UPDATE",
            channelName: name,
            channelDescription: description,
            channelAvatar: avatar,
            channelCover: cover,
        })
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export default updateChannel
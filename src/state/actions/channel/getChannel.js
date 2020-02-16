import Box from "3box"

import { store } from "../../store"

const getChannel = async address => {
    try {
        const ethernaSpace = await Box.getSpace(address, "ETHERNA")

        store.dispatch({
            type: "MY_CHANNEL_UPDATE",
            channelName: ethernaSpace.channelName,
            channelDescription: ethernaSpace.channelDescription,
            channelImage: ethernaSpace.channelImage,
            channelCover: ethernaSpace.channelCover
        })
    } catch (error) {
        console.error(error)
    }

    store.dispatch({
        type: "UI_PROFILE_LOADING",
        isFetchingChannel: false,
    })
}

export default getChannel

import Box from "3box"

import { store } from "../../store"
import getChannel from "./getChannel"

const getMyChannel = async address => {
    try {
        const channelData = await getChannel(address)

        store.dispatch({
            type: "MY_CHANNEL_UPDATE",
            channelName: channelData.channelName,
            channelDescription: channelData.channelDescription,
            channelAvatar: channelData.channelAvatar,
            channelCover: channelData.channelCover,
        })
    } catch (error) {
        console.error(error)
    }

    store.dispatch({
        type: "UI_PROFILE_LOADING",
        isFetchingChannel: false,
    })
}

export default getMyChannel

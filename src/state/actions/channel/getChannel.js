import Box from "3box"

const getChannel = async address => {
    const channelData = await Box.getSpace(address, "ETHERNA")
    return channelData
}

export default getChannel

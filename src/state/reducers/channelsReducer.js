const channelReducer = (state = {}, action) => {
    switch (action.type) {
        case 'MY_CHANNEL_UPDATE':
            return {
                ...state,
                channelName: action.channelName,
                channelDescription: action.channelDescription,
                channelImage: action.channelImage,
                channelCover: action.channelCover
            }

        default:
            return state
    }
}

export default channelReducer
import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { createChannel as createIndexChannel } from "@utils/ethernaResources/channelResources"

const createChannel = async address => {
  try {
    await createIndexChannel(address)

    store.dispatch({
      type: ProfileActionTypes.CREATE_CHANNEL,
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export default createChannel

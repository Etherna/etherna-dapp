import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { getProfile } from "@utils/swarmProfile"

const fetchProfile = async address => {
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
    isLoadingProfile: true,
  })

  try {
    const profile = await getProfile(address)
    const channel = await getChannelOrNull(address)

    store.dispatch({
      type: ProfileActionTypes.PROFILE_UPDATE,
      name: profile.name,
      description: profile.description,
      avatar: profile.avatar,
      cover: profile.cover,
      location: profile.location,
      website: profile.website,
      birthday: profile.birthday,
      existsOnIndex: channel !== null,
    })
  } catch (error) {
    console.error(error)
  }

  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
    isLoadingProfile: false,
  })
}

const getChannelOrNull = async address => {
  const { indexClient } = store.getState().env
  try {
    const channel = await indexClient.users.fetchUser(address)
    return channel
  } catch (error) {
    console.error(error)
    return null
  }
}

export default fetchProfile

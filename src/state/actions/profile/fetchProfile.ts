import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"
import SwarmProfile from "@classes/SwarmProfile"

/**
 * Fetch profile info
 * @param hash Manifest hash with profile data
 * @param address Profile address
 */
const fetchProfile = async (hash: string, address: string) => {
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
    isLoadingProfile: true,
  })

  try {
    const { beeClient } = store.getState().env
    const profile = await (new SwarmProfile({ beeClient, address, hash })).downloadProfile()

    if (!profile) throw new Error("Cannot fetch profile")

    store.dispatch({
      type: ProfileActionTypes.PROFILE_UPDATE,
      name: profile.name || "",
      description: profile.description || "",
      avatar: profile.avatar,
      cover: profile.cover,
      location: profile.location,
      website: profile.website,
      birthday: profile.birthday,
      existsOnIndex: true,
    })
  } catch (error) {
    console.error(error)
  }

  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
    isLoadingProfile: false,
  })
}

export default fetchProfile

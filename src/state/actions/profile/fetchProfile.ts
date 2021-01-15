import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { getProfile } from "@utils/swarmProfile"

/**
 * Fetch profile info
 * @param manifest Manifest hash with profile data
 * @param address Profile address
 */
const fetchProfile = async (manifest: string, address: string) => {
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
    isLoadingProfile: true,
  })

  try {
    const profile = await getProfile(manifest, address)

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

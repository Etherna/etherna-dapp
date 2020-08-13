import pollAddress from "./pollAddress"
import { store } from "@state/store"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { UserActionTypes } from "@state/reducers/userReducer"
import fetchProfile from "@state/actions/profile/fetchProfile"
import { resolveEnsName } from "@utils/ethFuncs"

/**
 *
 * @param {import("@utils/indexClient").IndexCurrentUser} profile
 */
const loadProfile = async (profile) => {
  const { web3 } = store.getState().env

  try {
    // fetching address ens name
    resolveEns(profile.address, web3)

    // fetching profile data
    fetchProfile(profile.identityManifest, profile.address)

    // observe address change
    pollAddress()
  } catch (error) {
    console.error(error)
    store.dispatch({
      type: UIActionTypes.UI_SHOW_ERROR,
      errorMessage: error.message,
      errorTitle: "Profile Error",
    })
  }
}

const resolveEns = async (address, web3) => {
  const ens = await resolveEnsName(address, web3)
  store.dispatch({
    type: UserActionTypes.USER_ENS_UPDATE,
    ens,
  })
}

export default loadProfile

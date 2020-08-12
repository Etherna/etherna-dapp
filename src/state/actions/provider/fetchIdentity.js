import { store } from "@state/store"
import { UserActionTypes } from "@state/reducers/userReducer"

/**
 * Fetch the current identity from the SSO server
 */
const fetchIdentity = async () => {
  try {
    const { indexClient } = store.getState().env

    const profile = await indexClient.users.fetchCurrentUser()

    store.dispatch({
      type: UserActionTypes.USER_UPDATE_IDENTITY,
      address: profile.address,
      manifest: profile.identityManifest,
      prevAddresses: profile.prevAddresses,
    })
    store.dispatch({
      type: UserActionTypes.USER_UPDATE_SIGNEDIN,
      isSignedIn: true,
    })

    return profile
  } catch (error) {
    console.error(error)

    return updateUserSignedOut()
  }
}

const updateUserSignedOut = () => {
  store.dispatch({
    type: UserActionTypes.USER_UPDATE_SIGNEDIN,
    isSignedIn: false,
  })
  return null
}

export default fetchIdentity

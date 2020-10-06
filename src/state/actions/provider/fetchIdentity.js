import { store } from "@state/store"
import { UserActionTypes } from "@state/reducers/userReducer"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

/**
 * Fetch the current identity from the SSO server
 */
const fetchIdentity = async () => {
  const { indexClient, gatewayClient } = store.getState().env

  const [profile, hasCredit] = await Promise.all([
    fetchIndexCurrentUser(indexClient),
    fetchCurrentUserCredit(gatewayClient),
    fetchCurrentBytePrice(gatewayClient),
  ])

  store.dispatch({
    type: UserActionTypes.USER_UPDATE_SIGNEDIN,
    isSignedIn: !!profile,
    isSignedInGateway: hasCredit
  })

  return profile
}

/**
 * @param {import("@utils/indexClient/client").default} indexClient
 */
const fetchIndexCurrentUser =  async indexClient => {
  try {
    const profile = await indexClient.users.fetchCurrentUser()

    store.dispatch({
      type: UserActionTypes.USER_UPDATE_IDENTITY,
      address: profile.address,
      manifest: profile.identityManifest,
      prevAddresses: profile.prevAddresses,
    })

    return profile
  } catch {
    return false
  }
}

/**
 * @param {import("@utils/gatewayClient/client").default} gatewayClient
 */
const fetchCurrentUserCredit =  async gatewayClient => {
  try {
    const credit = await gatewayClient.users.fetchCredit()

    store.dispatch({
      type: UserActionTypes.USER_UPDATE_CREDIT,
      credit,
    })

    return true
  } catch {
    store.dispatch({
      type: UserActionTypes.USER_UPDATE_CREDIT,
      credit: 0,
    })

    return false
  }
}

/**
 * @param {import("@utils/gatewayClient/client").default} gatewayClient
 */
const fetchCurrentBytePrice =  async gatewayClient => {
  try {
    const bytePrice = await gatewayClient.settings.fetchCurrentBytePrice()

    store.dispatch({
      type: EnvActionTypes.UPDATE_BYTE_PRICE,
      bytePrice,
    })

    return true
  } catch {
    return false
  }
}

export default fetchIdentity

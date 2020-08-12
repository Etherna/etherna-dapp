import injectWeb3 from "./injectWeb3"
import fetchIdentity from "./fetchIdentity"
import loadProfile from "./loadProfile"
import loginRedirect from "./loginRedirect"
import { checkMobileWeb3, checkNetwork } from "./network"

/**
 * Sign in user and fetch profile
 * @param {boolean} forceLogin Whether to send user to the Index login page
 */
const signin = async (forceLogin = false) => {
  if (forceLogin) {
    // Launch Index login
    loginRedirect()
  } else {
    await checkMobileWeb3()
    await injectWeb3()
    await checkNetwork()

    const profile = await fetchIdentity()
    if (profile) {
      await loadProfile(profile)
    }
  }
}

export default signin

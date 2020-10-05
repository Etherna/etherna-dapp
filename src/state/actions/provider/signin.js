import injectWeb3 from "./injectWeb3"
import fetchIdentity from "./fetchIdentity"
import loadProfile from "./loadProfile"
import loginRedirect from "./loginRedirect"
import { checkMobileWeb3, checkNetwork } from "./network"

/**
 * Sign in user and fetch profile
 * @param {boolean} forceLogin Whether to send user to the Index login page
 * @param {"index"|"gateway"} service Service to signin. `null` will propagate all services (default = null)
 */
const signin = async (forceLogin = false, service = null) => {
  if (forceLogin) {
    // Launch login
    loginRedirect(service)
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

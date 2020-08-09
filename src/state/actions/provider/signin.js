import injectWeb3 from "./injectWeb3"
import fetchIdentity from "./fetchIdentity"
import loadProfile from "./loadProfile"
import { checkMobileWeb3, checkNetwork } from "./network"
import ssoLogin from "./ssoLogin"

/**
 * Sign in user and fetch profile
 * @param {boolean} forceSSO Whether to send user to the SSO login page
 */
const signin = async (forceSSO = false) => {
  if (forceSSO) {
    // Launch SSO login
    ssoLogin()
  } else {
    await checkMobileWeb3()
    await injectWeb3()
    await checkNetwork()

    const signedIn = await fetchIdentity()
    if (signedIn) {
      await loadProfile()
    }
  }
}

export default signin

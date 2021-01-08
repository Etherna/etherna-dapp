import { store } from "@state/store"

/**
 * Redirect to the service login page
 * @param {string} service Service to signin
 */
const logoutRedirect = (service = null) => {
  const { indexClient, gatewayClient } = store.getState().env

  // strip query params
  const redirectUrl = window.location.origin + window.location.pathname

  switch (service) {
    case "index":
      indexClient.logoutRedirect(redirectUrl)
      break;
    case "gateway":
      gatewayClient.logoutRedirect(redirectUrl)
      break;
    case null:
    case undefined:
      indexClient.logoutRedirect(redirectUrl + "?signout=gateway")
      break;
    default:
      break;
  }
}

export default logoutRedirect

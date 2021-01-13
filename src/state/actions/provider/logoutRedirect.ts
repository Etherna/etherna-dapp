import { store } from "@state/store"

/**
 * Redirect to the service login page
 * @param service Service to signin
 */
const logoutRedirect = (service: "index"|"gateway"|String|null = null) => {
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

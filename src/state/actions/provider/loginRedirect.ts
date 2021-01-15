import { store } from "@state/store"

/**
 * Redirect to the service login page
 * @param service Service to signin
 */
const loginRedirect = (service: "index"|"gateway"|String|null = null) => {
  const { indexClient, gatewayClient } = store.getState().env

  // strip query params
  const redirectUrl = window.location.origin + window.location.pathname

  switch (service) {
    case "index":
      indexClient.loginRedirect(redirectUrl)
      break;
    case "gateway":
      gatewayClient.loginRedirect(redirectUrl)
      break;
    case null:
    case undefined:
      indexClient.loginRedirect(redirectUrl + "?signin=gateway")
      break;
    default:
      break;
  }
}

export default loginRedirect

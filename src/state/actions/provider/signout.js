import { store } from "@state/store"
import logoutRedirect from "./logoutRedirect"

const signout = async (clearStorage = true) => {
  const { isSignedIn, isSignedInGateway } = store.getState().user

  if (isSignedIn) {
    if (clearStorage) {
      clearStore()
    }
    logoutRedirect()
  }

  if (isSignedInGateway) {
    logoutRedirect("gateway")
  }
}

const clearStore = () => {
  window.localStorage.removeItem("defaultWallet")
  window.localStorage.removeItem("prevNetwork")
  window.localStorage.removeItem("currentNetwork")
  window.localStorage.removeItem("shouldShowSwitchNetwork")
}

export default signout

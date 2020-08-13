import { store } from "@state/store"

const signout = async (clearStorage = true) => {
  const { isSignedIn } = store.getState().user
  const { indexClient } = store.getState().env

  if (isSignedIn) {
    if (clearStorage) {
      clearStore()
    }
    indexClient.logoutRedirect()
  }
}

const clearStore = () => {
  window.localStorage.removeItem("defaultWallet")
  window.localStorage.removeItem("prevNetwork")
  window.localStorage.removeItem("currentNetwork")
  window.localStorage.removeItem("shouldShowSwitchNetwork")
}

export default signout

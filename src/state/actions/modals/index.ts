import { store } from "@state/store"
import { UIActionTypes } from "@state/reducers/uiReducer"

export const showError = (title: string, message: string) => {
  store.dispatch({
    type: UIActionTypes.SHOW_ERROR,
    errorTitle: title,
    errorMessage: message,
  })
}

export const closeErrorModal = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_ERROR,
    errorMessage: undefined,
    errorTitle: undefined,
  })
}

export const closeConnectingWalletModal = () => {
  store.dispatch({
    type: UIActionTypes.TOGGLE_CONNECTING_WALLET,
    isConnectingWallet: false,
  })
}

export const closeUnsupportedBrowserModal = () => {
  store.dispatch({
    type: UIActionTypes.TOGGLE_BROWSER_SUPPORT,
    showUnsupportedModal: false,
  })
}

export const closeShortcutModal = () => {
  store.dispatch({
    type: UIActionTypes.TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: false,
  })
}

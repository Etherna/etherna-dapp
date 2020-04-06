import { store } from "state/store"
import { UIActionTypes } from "state/reducers/uiReducer"

export const showError = (title, message) => {
    store.dispatch({
        type: UIActionTypes.UI_SHOW_ERROR,
        errorTitle: title,
        errorMessage: message,
    })
}

export const closeErrorModal = () => {
    store.dispatch({
        type: UIActionTypes.UI_HIDE_ERROR,
        errorMessage: undefined,
        errorTitle: undefined,
    })
}

export const closeConnectingWalletModal = () => {
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_CONNECTING_WALLET,
        isConnectingWallet: false,
    })
}

export const closeUnsupportedBrowserModal = () => {
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_BROWSER_SUPPORT,
        showUnsupportedModal: false,
    })
}

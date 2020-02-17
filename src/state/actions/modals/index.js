import { store } from "../../store"

export const closeErrorModal = () => {
    store.dispatch({
        type: "UI_CLOSE_ERROR_MODAL",
        errorMessage: '',
        showErrorModal: false,
    })
}

export const closeConsentModal = () => {
    store.dispatch({
        type: "UI_HANDLE_CONSENT_MODAL",
        provideConsent: false,
    })
}

export const closeUnsupportedBrowserModal = () => {
    store.dispatch({
        type: "UI_UNSUPPORTED_BROWSER_MODAL",
        showUnsupportedBrowser: false,
    })
}


export const handleSwitchedAddressModal = () => {
    store.dispatch({
        type: 'UI_HANDLE_SWITCHED_ADDRESS_MODAL',
        switchedAddressModal: !store.getState().uiState.switchedAddressModal,
    })
}
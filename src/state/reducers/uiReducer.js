const uiReducer = (state = {}, action) => {
    switch (action.type) {
        case "UI_3BOX_LOADING":
            return {
                ...state,
                provideConsent: action.provideConsent,
                isFetchingThreeBox: action.isFetchingThreeBox,
            }

        case "UI_PROFILE_LOADING":
            return {
                ...state,
                isFetchingChannel: action.isFetchingChannel,
            }

        case "UI_3BOX_FAILED":
            return {
                ...state,
                isFetchingThreeBox: false,
                showErrorModal: true,
                provideConsent: false,
                errorMessage: action.errorMessage,
            }

        case "UI_3BOX_FETCHING":
            return {
                ...state,
                isFetchingThreeBox: action.isFetchingThreeBox,
            }

        case "UI_APP_SYNC":
            return {
                ...state,
                isSyncing: action.isSyncing,
                onSyncFinished: action.onSyncFinished,
            }

        case "UI_HANDLE_CONSENT_MODAL":
            return {
                ...state,
                provideConsent: action.provideConsent,
                showSignInBanner: action.showSignInBanner,
            }

        case "UI_CLOSE_ERROR_MODAL":
            return {
                ...state,
                errorMessage: "",
                showErrorModal: false,
            }

        case "UI_UNSUPPORTED_BROWSER_MODAL":
            return {
                ...state,
                showUnsupportedBrowser: action.showUnsupportedBrowser,
            }

        case "UI_HANDLE_SWITCHED_ADDRESS_MODAL":
            return {
                ...state,
                switchedAddressModal: action.switchedAddressModal,
                isFetchingThreeBox: false,
                prevAddress: action.prevAddress,
            }

        default:
            return state
    }
}

export default uiReducer

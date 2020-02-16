const uiReducer = (state = {}, action) => {
    switch (action.type) {
        case "UI_3BOX_LOADING":
            return {
                ...state,
                provideConsent: action.provideConsent,
                isFetchingThreeBox: action.isFetchingThreeBox,
            }

        case "UI_3BOX_FAILED":
            return {
                ...state,
                isFetchingThreeBox: false,
                showErrorModal: true,
                provideConsent: false,
                errorMessage: action.errorMessage,
            }

        case 'UI_3BOX_FETCHING':
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

        default:
            return state
    }
}

export default uiReducer

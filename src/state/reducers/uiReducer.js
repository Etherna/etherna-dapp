export const UIActionTypes = {
    UI_SHOW_ERROR: "UI_SHOW_ERROR",
    UI_HIDE_ERROR: "UI_HIDE_ERROR",
    UI_TOGGLE_CONNECTING_WALLET: "UI_TOGGLE_CONNECTING_WALLET",
    UI_TOGGLE_LOADING_PROFILE: "UI_TOGGLE_LOADING_PROFILE",
    UI_TOGGLE_BROWSER_SUPPORT: "UI_TOGGLE_BROWSER_SUPPORT",
    UI_TOGGLE_NETWORK_CHANGE: "UI_TOGGLE_NETWORK_CHANGE",
    UI_TOGGLE_ADDRESS_CHANGE: "UI_TOGGLE_ADDRESS_CHANGE",
}

const uiReducer = (state = {}, action) => {
    switch (action.type) {
        case UIActionTypes.UI_SHOW_ERROR:
            return {
                ...state,
                errorMessage: action.errorMessage,
                errorTitle: action.errorTitle,
            }

        case UIActionTypes.UI_HIDE_ERROR:
            return {
                ...state,
                errorMessage: undefined,
                errorTitle: undefined,
            }

        case UIActionTypes.UI_TOGGLE_CONNECTING_WALLET:
            return {
                ...state,
                isConnectingWallet: action.isConnectingWallet,
            }

        case UIActionTypes.UI_TOGGLE_LOADING_PROFILE:
            return {
                ...state,
                isLoadingProfile: action.isLoadingProfile,
            }

        case UIActionTypes.UI_TOGGLE_BROWSER_SUPPORT:
            return {
                ...state,
                showUnsupportedModal: action.showUnsupportedModal,
            }

        case UIActionTypes.UI_TOGGLE_NETWORK_CHANGE:
            return {
                ...state,
                showNetwokChangeModal: action.showNetwokChangeModal,
            }

        case UIActionTypes.UI_TOGGLE_ADDRESS_CHANGE:
            return {
                ...state,
                showAccountSwitchModal: action.showAccountSwitchModal,
            }

        default:
            return state
    }
}

export default uiReducer

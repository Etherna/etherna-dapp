export const UIActionTypes = {
  UI_SHOW_ERROR: "UI_SHOW_ERROR",
  UI_HIDE_ERROR: "UI_HIDE_ERROR",
  UI_TOGGLE_CONNECTING_WALLET: "UI_TOGGLE_CONNECTING_WALLET",
  UI_TOGGLE_LOADING_PROFILE: "UI_TOGGLE_LOADING_PROFILE",
  UI_TOGGLE_BROWSER_SUPPORT: "UI_TOGGLE_BROWSER_SUPPORT",
  UI_TOGGLE_NETWORK_CHANGE: "UI_TOGGLE_NETWORK_CHANGE",
  UI_TOGGLE_EDITING_SHORTCUT: "UI_TOGGLE_EDITING_SHORTCUT",
  UI_TOGGLE_IMAGE_CROPPER: "UI_TOGGLE_IMAGE_CROPPER",
}

/**
 * @param {import("../typings").UIState} state
 * @param {object} action
 * @returns {import("../typings").UIState}
 */
const uiReducer = (state = {}, action) => {
  switch (action.type) {
    case UIActionTypes.UI_SHOW_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage,
        errorTitle: action.errorTitle,
        isConnectingWallet: false,
        isLoadingProfile: false,
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

    case UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT:
      return {
        ...state,
        isEditingShortcut: action.isEditingShortcut,
      }

    case UIActionTypes.UI_TOGGLE_IMAGE_CROPPER:
      return {
        ...state,
        isCroppingImage: action.isCroppingImage,
      }

    default:
      return state
  }
}

export default uiReducer

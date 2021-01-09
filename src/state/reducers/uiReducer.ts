import { UIState } from "@state/typings"

export const UIActionTypes = {
  UI_SHOW_ERROR: "UI_SHOW_ERROR",
  UI_HIDE_ERROR: "UI_HIDE_ERROR",
  UI_TOGGLE_CONNECTING_WALLET: "UI_TOGGLE_CONNECTING_WALLET",
  UI_TOGGLE_LOADING_PROFILE: "UI_TOGGLE_LOADING_PROFILE",
  UI_TOGGLE_BROWSER_SUPPORT: "UI_TOGGLE_BROWSER_SUPPORT",
  UI_TOGGLE_NETWORK_CHANGE: "UI_TOGGLE_NETWORK_CHANGE",
  UI_TOGGLE_EDITING_SHORTCUT: "UI_TOGGLE_EDITING_SHORTCUT",
  UI_TOGGLE_IMAGE_CROPPER: "UI_TOGGLE_IMAGE_CROPPER",
} as const


// Export dispatch actions
type ShowErrorAction = {
  type: typeof UIActionTypes.UI_SHOW_ERROR
  errorMessage?: string
  errorTitle?: string
}
type HideErrorAction = {
  type: typeof UIActionTypes.UI_HIDE_ERROR
}
type ToggleConnectingWalletAction = {
  type: typeof UIActionTypes.UI_TOGGLE_CONNECTING_WALLET
  isConnectingWallet: boolean
}
type ToggleLoadingProfileAction = {
  type: typeof UIActionTypes.UI_TOGGLE_LOADING_PROFILE
  isLoadingProfile: boolean
}
type ToggleBrowserSupportAction = {
  type: typeof UIActionTypes.UI_TOGGLE_BROWSER_SUPPORT
  showUnsupportedModal: boolean
}
type ToggleNetworkChangeAction = {
  type: typeof UIActionTypes.UI_TOGGLE_NETWORK_CHANGE
  showNetwokChangeModal: boolean
}
type ToggleEditingShortcutAction = {
  type: typeof UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT
  isEditingShortcut: boolean
}
type ToggleImageCropperAction = {
  type: typeof UIActionTypes.UI_TOGGLE_IMAGE_CROPPER
  isCroppingImage: boolean
}

export type UIActions = (
  ShowErrorAction |
  HideErrorAction |
  ToggleConnectingWalletAction |
  ToggleLoadingProfileAction |
  ToggleBrowserSupportAction |
  ToggleNetworkChangeAction |
  ToggleEditingShortcutAction |
  ToggleImageCropperAction
)


// Init reducer
const uiReducer = (state: UIState = {}, action: UIActions): UIState => {
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

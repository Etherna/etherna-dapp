/* 
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Crop } from "react-image-crop"

import type { UIState } from "@/definitions/app-state"

export const UIActionTypes = {
  SHOW_ERROR: "UI_SHOW_ERROR",
  HIDE_ERROR: "UI_HIDE_ERROR",
  TOGGLE_CONFIRMATION: "UI_TOGGLE_CONFIRMATION",
  SHOW_EXTENSION_HOSTS_EDITOR: "UI_SHOW_EXTENSION_HOSTS_EDITOR",
  HIDE_EXTENSION_HOSTS_EDITOR: "UI_HIDE_EXTENSION_HOSTS_EDITOR",
  TOGGLE_CONNECTING_WALLET: "UI_TOGGLE_CONNECTING_WALLET",
  TOGGLE_LOADING_PROFILE: "UI_TOGGLE_LOADING_PROFILE",
  TOGGLE_NETWORK_CHANGE: "UI_TOGGLE_NETWORK_CHANGE",
  TOGGLE_EDITING_SHORTCUT: "UI_TOGGLE_EDITING_SHORTCUT",
  TOGGLE_IMAGE_CROPPER: "UI_TOGGLE_IMAGE_CROPPER",
  SET_CROP_IMAGE: "UI_SET_CROP_IMAGE",
  UPDATE_IMAGE_CROP: "UI_UPDATE_IMAGE_CROP",
} as const


// Export dispatch actions
type ShowErrorAction = {
  type: typeof UIActionTypes.SHOW_ERROR
  errorMessage?: string
  errorTitle?: string
}
type HideErrorAction = {
  type: typeof UIActionTypes.HIDE_ERROR
}
type ToggleConfirmationAction = {
  type: typeof UIActionTypes.TOGGLE_CONFIRMATION
  confirmTitle?: string
  confirmMessage?: string
  confirmButtonTitle?: string
  confirmButtonType?: "default" | "destructive"
}
type ShowExtensionHostsEditorAction = {
  type: typeof UIActionTypes.SHOW_EXTENSION_HOSTS_EDITOR
  extensionName: "index" | "gateway"
  extensionUrl: string
}
type HideExtensionHostsEditorAction = {
  type: typeof UIActionTypes.HIDE_EXTENSION_HOSTS_EDITOR
}
type ToggleConnectingWalletAction = {
  type: typeof UIActionTypes.TOGGLE_CONNECTING_WALLET
  isConnectingWallet: boolean
}
type ToggleLoadingProfileAction = {
  type: typeof UIActionTypes.TOGGLE_LOADING_PROFILE
  isLoadingProfile: boolean
}
type ToggleNetworkChangeAction = {
  type: typeof UIActionTypes.TOGGLE_NETWORK_CHANGE
  showNetwokChangeModal: boolean
}
type ToggleEditingShortcutAction = {
  type: typeof UIActionTypes.TOGGLE_EDITING_SHORTCUT
  isEditingShortcut: boolean
}
type ToggleImageCropperAction = {
  type: typeof UIActionTypes.TOGGLE_IMAGE_CROPPER
  isCroppingImage: boolean
}
type SetCropImageAction = {
  type: typeof UIActionTypes.SET_CROP_IMAGE
  imageType: "avatar" | "cover"
  image: string
}
type UpdateImageCropAction = {
  type: typeof UIActionTypes.UPDATE_IMAGE_CROP
  imageCrop?: Partial<Crop>
}

export type UIActions = (
  ShowErrorAction |
  HideErrorAction |
  ToggleConfirmationAction |
  ShowExtensionHostsEditorAction |
  HideExtensionHostsEditorAction |
  ToggleConnectingWalletAction |
  ToggleLoadingProfileAction |
  ToggleNetworkChangeAction |
  ToggleEditingShortcutAction |
  ToggleImageCropperAction |
  SetCropImageAction |
  UpdateImageCropAction
)


// Init reducer
const uiReducer = (state: UIState = {}, action: UIActions): UIState => {
  switch (action.type) {
    case UIActionTypes.SHOW_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage,
        errorTitle: action.errorTitle,
        isConnectingWallet: false,
        isLoadingProfile: false,
      }

    case UIActionTypes.HIDE_ERROR:
      return {
        ...state,
        errorMessage: undefined,
        errorTitle: undefined,
      }

    case UIActionTypes.TOGGLE_CONFIRMATION:
      return {
        ...state,
        confirmTitle: action.confirmTitle,
        confirmMessage: action.confirmMessage,
        confirmButtonTitle: action.confirmButtonTitle,
        confirmButtonType: action.confirmButtonType,
      }

    case UIActionTypes.SHOW_EXTENSION_HOSTS_EDITOR:
      return {
        ...state,
        extensionName: action.extensionName,
        extensionUrl: action.extensionUrl,
      }

    case UIActionTypes.HIDE_EXTENSION_HOSTS_EDITOR:
      return {
        ...state,
        extensionName: undefined,
        extensionUrl: undefined,
      }

    case UIActionTypes.TOGGLE_CONNECTING_WALLET:
      return {
        ...state,
        isConnectingWallet: action.isConnectingWallet,
      }

    case UIActionTypes.TOGGLE_LOADING_PROFILE:
      return {
        ...state,
        isLoadingProfile: action.isLoadingProfile,
      }

    case UIActionTypes.TOGGLE_NETWORK_CHANGE:
      return {
        ...state,
        showNetwokChangeModal: action.showNetwokChangeModal,
      }

    case UIActionTypes.TOGGLE_EDITING_SHORTCUT:
      return {
        ...state,
        isEditingShortcut: action.isEditingShortcut,
      }

    case UIActionTypes.TOGGLE_IMAGE_CROPPER:
      return {
        ...state,
        isCroppingImage: action.isCroppingImage,
      }

    case UIActionTypes.UPDATE_IMAGE_CROP:
      return {
        ...state,
        imageCrop: action.imageCrop,
      }

    case UIActionTypes.SET_CROP_IMAGE:
      return {
        ...state,
        imageType: action.imageType,
        image: action.image,
      }

    default:
      return state
  }
}

export default uiReducer

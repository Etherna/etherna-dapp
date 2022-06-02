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

import { store } from "@/state/store"
import { UIActionTypes } from "@/state/reducers/uiReducer"

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

export const closeShortcutModal = () => {
  store.dispatch({
    type: UIActionTypes.TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: false,
  })
}

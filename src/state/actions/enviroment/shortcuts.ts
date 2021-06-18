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

import { defaultKeymap, KEYMAP_OVERRIDE_NAME } from "@keyboard"
import { Keymap, KeymapNamespace } from "@keyboard/typings"
import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"

export const editShortcut = (namespace: KeymapNamespace, key: string) => {
  store.dispatch({
    type: EnvActionTypes.ENV_EDIT_SHORTCUT,
    shortcutNamespace: namespace,
    shortcutKey: key,
  })
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: true,
  })
}

export const resetShortcut = (namespace: KeymapNamespace, key: string) => {
  store.dispatch({
    type: EnvActionTypes.ENV_EDIT_SHORTCUT,
    shortcutNamespace: namespace,
    shortcutKey: key,
  })

  saveShortcut(null)
}

export const hasCustomShortcut = (namespace: string, key: string) => {
  const keymap = localKeymap()
  return namespace in keymap && key in keymap[namespace]
}

export const saveShortcut = (newShortcut: string|null|undefined) => {
  const { keymap, shortcutNamespace, shortcutKey } = store.getState().env

  if (!shortcutNamespace || !shortcutKey) return

  // Create keymap in redux store
  let newKeymap = {
    ...keymap,
  }
  newKeymap[shortcutNamespace][shortcutKey] = newShortcut || defaultKeymap[shortcutNamespace][shortcutKey]
  store.dispatch({
    type: EnvActionTypes.ENV_UPDATE_KEYMAP,
    keymap: newKeymap,
  })

  // Save locally user's keymap preferences
  let keymapOverride = localKeymap()
  keymapOverride[shortcutNamespace] = keymapOverride[shortcutNamespace] || {}
  if (newShortcut != null) {
    keymapOverride[shortcutNamespace][shortcutKey] = newShortcut
  } else {
    delete keymapOverride[shortcutNamespace][shortcutKey]
  }
  saveKeymap(keymapOverride)

  // Finish editing
  store.dispatch({
    type: EnvActionTypes.ENV_EDIT_SHORTCUT,
    shortcutNamespace: undefined,
    shortcutKey: undefined,
  })
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: false,
  })
}

export const shortcutExists = (shortcut: string) => {
  const { keymap } = store.getState().env
  for (const namespace in keymap) {
    for (const shortcutKey in keymap[namespace as KeymapNamespace]) {
      if (keymap[namespace as KeymapNamespace][shortcutKey] === shortcut) {
        return shortcutKey
      }
    }
  }
  return false
}

// Private functions

const localKeymap = () => {
  return JSON.parse(window.localStorage.getItem(KEYMAP_OVERRIDE_NAME) || "{}")
}

const saveKeymap = (keymap: Keymap) => {
  window.localStorage.setItem(KEYMAP_OVERRIDE_NAME, JSON.stringify(keymap))
}

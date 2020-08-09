import { defaultKeymap, KEYMAP_OVERRIDE_NAME } from "@keyboard"
import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"

export const editShortcut = (namespace, key) => {
  store.dispatch({
    type: EnvActionTypes.EDIT_SHORTCUT,
    shortcutNamespace: namespace,
    shortcutKey: key,
  })
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: true,
  })
}

export const resetShortcut = (namespace, key) => {
  store.dispatch({
    type: EnvActionTypes.EDIT_SHORTCUT,
    shortcutNamespace: namespace,
    shortcutKey: key,
  })

  saveShortcut(null)
}

export const hasCustomShortcut = (namespace, key) => {
  const keymap = localKeymap()
  return namespace in keymap && key in keymap[namespace]
}

export const saveShortcut = newShortcut => {
  const { keymap, shortcutNamespace, shortcutKey } = store.getState().env

  // Create keymap in redux store
  let newKeymap = {
    ...keymap,
  }
  newKeymap[shortcutNamespace][shortcutKey] =
    newShortcut || defaultKeymap[shortcutNamespace][shortcutKey]
  store.dispatch({
    type: EnvActionTypes.UPDATE_KEYMAP,
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
    type: EnvActionTypes.EDIT_SHORTCUT,
    shortcutNamespace: undefined,
    shortcutKey: undefined,
  })
  store.dispatch({
    type: UIActionTypes.UI_TOGGLE_EDITING_SHORTCUT,
    isEditingShortcut: false,
  })
}

export const shortcutExists = shortcut => {
  const { keymap } = store.getState().env
  for (let namespace in keymap) {
    for (let shortcutKey in keymap[namespace]) {
      if (keymap[namespace][shortcutKey] === shortcut) {
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

const saveKeymap = keymap => {
  window.localStorage.setItem(KEYMAP_OVERRIDE_NAME, JSON.stringify(keymap))
}

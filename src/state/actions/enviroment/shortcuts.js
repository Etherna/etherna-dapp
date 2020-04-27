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

export const saveShortcut = (newShortcut) => {
    const { keymap, shortcutNamespace, shortcutKey } = store.getState().env

    // Create new keymap
    let newKeymap = {
        ...keymap
    }
    keymap[shortcutNamespace][shortcutKey] = newShortcut

    // Save locally user's keymap preferences
    let keymapOverride = JSON.parse(window.localStorage.getItem("keymapOverride") || "{}")
    keymapOverride[shortcutNamespace] = keymapOverride[shortcutNamespace] || {}
    keymapOverride[shortcutNamespace][shortcutKey] = newShortcut
    window.localStorage.setItem("keymapOverride", JSON.stringify(keymapOverride))

    store.dispatch({
        type: EnvActionTypes.UPDATE_KEYMAP,
        keymap: newKeymap,
    })
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


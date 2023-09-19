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

import { useCallback } from "react"

import { getDefaultKeymap } from "@/keyboard"
import useSettingsStore from "@/stores/settings"
import useUIStore from "@/stores/ui"

import type { KeymapNamespace } from "@/types/keyboard"

export default function useShortcutsEditor() {
  const keymap = useSettingsStore(state => state.keymap)
  const editingShortcut = useUIStore(state => state.shortcut)
  const updateKeymap = useSettingsStore(state => state.updateKeymap)
  const editShortcut = useUIStore(state => state.showShortcut)
  const hideShortcutEditor = useUIStore(state => state.hideShortcut)

  const hasCustomShortcut = useCallback(
    (namespace: KeymapNamespace, key: string) => {
      return namespace in keymap && key in keymap[namespace]
    },
    [keymap]
  )

  const updateShortcut = useCallback(
    (
      namespace: KeymapNamespace | undefined,
      shortcutKey: string | undefined,
      newShortcut: string | null | undefined
    ) => {
      if (!namespace || !shortcutKey) return

      // Create keymap in redux store
      let newKeymap = {
        ...keymap,
      }
      const defaultKeymap = getDefaultKeymap()
      newKeymap[namespace][shortcutKey] =
        newShortcut !== undefined ? newShortcut || "" : defaultKeymap[namespace][shortcutKey]

      updateKeymap(newKeymap)

      // Finish editing
      hideShortcutEditor()
    },
    [keymap, hideShortcutEditor, updateKeymap]
  )

  const shortcutExists = useCallback(
    (shortcut: string) => {
      for (const namespace in keymap) {
        for (const shortcutKey in keymap[namespace as KeymapNamespace]) {
          if (keymap[namespace as KeymapNamespace][shortcutKey] === shortcut) {
            return shortcutKey
          }
        }
      }
      return null
    },
    [keymap]
  )

  const saveShortcut = useCallback(
    (newShortcut: string | null | undefined) => {
      if (!editingShortcut) return

      const { namespace, key } = editingShortcut
      updateShortcut(namespace, key, newShortcut)
    },
    [editingShortcut, updateShortcut]
  )

  const resetShortcut = useCallback(
    (namespace: KeymapNamespace, key: string) => {
      updateShortcut(namespace, key, undefined)
    },
    [updateShortcut]
  )

  return {
    editShortcut,
    hasCustomShortcut,
    resetShortcut,
    saveShortcut,
    shortcutExists,
    updateShortcut,
  }
}

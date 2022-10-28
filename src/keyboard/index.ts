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
import { PlayerKeymap } from "./keymaps/player"
import { deepCloneObject } from "@/utils/object"

import type { Shortcuts, KeymapNamespace } from "@/types/keyboard"

export { PlayerActions } from "./keymaps/player"

export const getDefaultKeymap = () => ({
  APP: {} as Shortcuts,
  PLAYER: { ...PlayerKeymap },
})

export type Keymaps = ReturnType<typeof getDefaultKeymap>

export const optimizeKeymapsForStorage = (keymaps: Keymaps) => {
  const optimizedKeymap = deepCloneObject(keymaps)
  const defaultKeymap = getDefaultKeymap()

  for (const [namespace, keymap] of Object.entries(optimizedKeymap) as [
    n: KeymapNamespace,
    s: Shortcuts
  ][]) {
    for (const [key, shortcut] of Object.entries(keymap)) {
      if (shortcut === "") {
        delete optimizedKeymap[namespace][key]
      } else if (optimizedKeymap[namespace][key] === defaultKeymap[namespace]?.[key]) {
        delete optimizedKeymap[namespace][key]
      }
    }
  }

  return optimizedKeymap
}

export const mergeKeymaps = (baseKeymaps: Keymaps, keymaps: Keymaps | undefined) => {
  // console.log(baseKeymaps)
  const mergedKeymap = { ...baseKeymaps }

  if (!keymaps) {
    return mergedKeymap
  }

  for (const [namespace, keymap] of Object.entries(keymaps) as [
    n: KeymapNamespace,
    s: Shortcuts
  ][]) {
    for (const [key, shortcut] of Object.entries(keymap)) {
      mergedKeymap[namespace][key] = shortcut
    }
  }

  return mergedKeymap
}

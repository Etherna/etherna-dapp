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
import { Keymap, KeymapNamespace } from "./typings"

const KEYMAP_OVERRIDE_NAME = "keymapOverride"

const defaultKeymap: Keymap = {
  APP: {},
  PLAYER: {
    ...PlayerKeymap,
  },
}

// Apply user overrided shortcuts
let baseKeymap = { ...defaultKeymap }
const keymapOverride = JSON.parse(window.localStorage.getItem(KEYMAP_OVERRIDE_NAME) || "{}")
Object.keys(baseKeymap).forEach(namespace => {
  baseKeymap[namespace as KeymapNamespace] = {
    ...baseKeymap[namespace as KeymapNamespace],
    ...(keymapOverride[namespace] || {}),
  }
})

export { KEYMAP_OVERRIDE_NAME, defaultKeymap, baseKeymap }

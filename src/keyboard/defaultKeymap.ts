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

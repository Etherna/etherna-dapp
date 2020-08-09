import { PlayerKeymap } from "./keymaps/player"

const KEYMAP_OVERRIDE_NAME = "keymapOverride"

const defaultKeymap = {
  PLAYER: {
    ...PlayerKeymap,
  },
}

// Apply user overrided shortcuts
let baseKeymap = { ...defaultKeymap }
const keymapOverride = JSON.parse(window.localStorage.getItem(KEYMAP_OVERRIDE_NAME) || "{}")
Object.keys(baseKeymap).forEach(namespace => {
  baseKeymap[namespace] = {
    ...baseKeymap[namespace],
    ...(keymapOverride[namespace] || {}),
  }
})

export { KEYMAP_OVERRIDE_NAME, defaultKeymap, baseKeymap }

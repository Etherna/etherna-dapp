import { PlayerKeymap } from "./keymaps/player"

let baseKeymap = {
    PLAYER: {
        ...PlayerKeymap,
    },
}

// Apply user overrided shortcuts
const keymapOverride = JSON.parse(
    window.localStorage.getItem("keymapOverride") || "{}"
)
Object.keys(baseKeymap).forEach(namespace => {
    baseKeymap[namespace] = {
        ...baseKeymap[namespace],
        ...(keymapOverride[namespace] || {}),
    }
})

export default baseKeymap

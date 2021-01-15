export type KeymapNamespace = "APP" | "PLAYER"

type Shortcuts = {
  [key: string]: string | undefined
}

export type Keymap = {
  APP: Shortcuts
  PLAYER: Shortcuts
  [namespace: KeymapNamespace]: Shortcuts
}

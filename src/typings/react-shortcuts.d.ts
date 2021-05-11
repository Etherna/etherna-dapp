declare module "react-shortcuts" {
  import React from "react"
  import { EventEmitter } from "events"

  type ShortcutsKeymap = {
    [namespace: string]: {
      [key: string]: string
    }
  }

  type ShortcutsProps = {
    children?: React.ReactNode
    handler?: (action: string, event: Event) => void
    name?: string
    tabIndex?: number
    className?: string
    eventType?: string
    stopPropagation?: boolean
    preventDefault?: boolean
    targetNodeSelector?: string
    global?: boolean
    isolate?: boolean
    alwaysFireHandler?: boolean
  }

  export class ShortcutManager extends EventEmitter {
    constructor(keymap: ShortcutsKeymap = {})
    setKeymap(keymap: ShortcutsKeymap)
    extendKeymap(keymap: ShortcutsKeymap)
    getAllShortcuts(): ShortcutsKeymap
    getAllShortcutsForPlatform(platformName: string): string[]
  }

  export class Shortcuts extends React.Component<ShortcutsProps> {}
}

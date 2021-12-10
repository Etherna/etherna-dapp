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
    constructor(keymap: ShortcutsKeymap)
    setKeymap(keymap: ShortcutsKeymap): void
    extendKeymap(keymap: ShortcutsKeymap): void
    getAllShortcuts(): ShortcutsKeymap
    getAllShortcutsForPlatform(platformName: string): string[]
  }

  export class Shortcuts extends React.Component<ShortcutsProps> { }
}

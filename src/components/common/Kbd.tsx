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
 *  
 */

import React from "react"

import classes from "@styles/components/common/Kbd.module.scss"

type KbdProps = {
  shortcut: string
  className?: string
}

const Kbd = ({ shortcut, className }: KbdProps) => {
  const isApple = /(Mac|iPhone|iPod|iPad|iPhone|iPod|iPad)/i.test(navigator.platform)
  const multiKeys = shortcut.split("+").map(k => {
    let key = k.trim().toLowerCase()
    switch (key) {
      case "enter":
        return "↩︎"
      case "cmd":
      case "command":
        return "⌘"
      case "del":
      case "delete":
        return "⌦"
      case "backspace":
        return "⌫"
      case "control":
        return "ctrl"
      case "option":
      case "alt":
        return isApple ? "⌥" : "alt"
      case "shoft":
        return "⇧"
      case "left":
        return "←"
      case "right":
        return "→"
      case "up":
        return "↑"
      case "down":
        return "↓"
      default:
        return key
    }
  })

  return (
    <span className={className}>
      {multiKeys.map((k, i) => (
        <React.Fragment key={i}>
          <kbd className={classes.kbd}>{k}</kbd>
          {i + 1 < multiKeys.length && <span>+</span>}
        </React.Fragment>
      ))}
    </span>
  )
}

export default Kbd

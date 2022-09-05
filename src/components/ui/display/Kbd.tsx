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
import React, { useEffect, useMemo, useRef } from "react"
import classNames from "classnames"

type KbdProps = {
  shortcut: string
  className?: string
}

const Kbd: React.FC<KbdProps> = ({ shortcut, className }) => {
  const kbdWrapper = useRef<HTMLDivElement>(null)
  const initialFontSize = useRef<number>()

  const multiKeys = useMemo(() => {
    const platform = navigator?.userAgentData?.platform || navigator?.platform || "unknown"
    const isApple = /(Mac|iPhone|iPod|iPad|iPhone|iPod|iPad)/i.test(platform)
    const multiKeys = (shortcut ?? "").split("+").map(k => {
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
        case "shift":
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
    return multiKeys
  }, [shortcut])

  useEffect(() => {
    if (!kbdWrapper.current) return
    if (!initialFontSize.current) {
      initialFontSize.current = parseInt(getComputedStyle(kbdWrapper.current).fontSize)
    }

    let fontSize = initialFontSize.current
    kbdWrapper.current.style.fontSize = fontSize + "px"
    while (kbdWrapper.current.scrollWidth > kbdWrapper.current.clientWidth) {
      fontSize -= 2
      kbdWrapper.current.style.fontSize = fontSize + "px"
    }
  }, [shortcut])

  return (
    <span className={classNames("flex items-center justify-center", className)} ref={kbdWrapper}>
      {multiKeys.map((k, i) => (
        <React.Fragment key={i}>
          <kbd
            className={classNames(
              "inline-block font-bold text-center whitespace-nowrap px-2 rounded",
              "border-b-2 border-gray-300 dark:border-gray-700",
              "text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-800"
            )}
          >
            {k}
          </kbd>
          {i + 1 < multiKeys.length && <span>+</span>}
        </React.Fragment>
      ))}
    </span>
  )
}

export default Kbd

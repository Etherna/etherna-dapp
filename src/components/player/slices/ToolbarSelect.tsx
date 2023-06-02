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

import React, { useState } from "react"
import { usePopper } from "react-popper"
import { Listbox, Portal } from "@headlessui/react"

import classNames from "@/utils/classnames"

type ToolbarSelectProps = {
  children?: React.ReactNode
  value: string
  options: { value: string; label: string }[]
  onSelect?(optionValue?: string | { value: string } | undefined): void
}

const ToolbarSelect: React.FC<ToolbarSelectProps> = ({ children, value, options, onSelect }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [buttonEl, setButtonEl] = useState<HTMLButtonElement | null>(null)
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(buttonEl, menuEl, {
    placement: "top",
  })

  return (
    <div>
      <button
        className={classNames(
          "flex h-5 items-center rounded px-1.5 md:h-7 md:px-3",
          "text-center text-xs font-semibold text-gray-200",
          "bg-gray-500/50 backdrop-blur"
        )}
        ref={el => el && el !== buttonEl && setButtonEl(el)}
        onMouseOver={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {children}
      </button>

      <Portal>
        <div
          className={classNames("z-20 pt-1 pb-10 transition-opacity duration-200", {
            "pointer-events-none opacity-0": !showMenu,
            "pointer-events-auto opacity-100 ": showMenu,
          })}
          ref={el => el && el !== menuEl && setMenuEl(el)}
          style={{ ...styles.popper }}
          {...attributes.popper}
          onMouseOver={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <ul
            className={classNames(
              "flex flex-col space-y-2 rounded px-2 py-4",
              "bg-gray-800/75 text-gray-200 backdrop-blur"
            )}
          >
            {options.map(option => (
              <li
                className={classNames(
                  "cursor-pointer px-2 text-center text-sm font-semibold focus:outline-none",
                  {
                    "text-primary-500": option.value === value,
                  }
                )}
                key={option.value}
                onClick={() => onSelect?.(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}

export default ToolbarSelect

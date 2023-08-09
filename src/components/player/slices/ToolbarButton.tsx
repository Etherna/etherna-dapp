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

import React, { useCallback, useRef, useState } from "react"
import { usePopper } from "react-popper"
import { Portal } from "@headlessui/react"

import { cn } from "@/utils/classnames"

type ToolbarButtonProps = {
  children?: React.ReactNode
  hasMenu?: boolean
  icon?: React.ReactElement<React.SVGAttributes<SVGElement>>
  onClick?(e: React.MouseEvent): void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ children, icon, hasMenu, onClick }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [buttonEl, setButtonEl] = useState<HTMLDivElement | null>(null)
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(buttonEl, menuEl, {
    placement: "top",
  })

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLDivElement
      if (menuEl?.contains(target) || target === menuEl) return

      onClick?.(e)
    },
    [menuEl, onClick]
  )

  return (
    <div
      className={cn(
        "group z-1 h-7 w-7 rounded-full p-1.5 md:h-8 md:w-8 md:p-[0.425rem]",
        "bg-gray-500/50 text-gray-200 backdrop-blur"
      )}
      role="button"
      ref={el => el && el !== buttonEl && setButtonEl(el)}
      onClick={handleClick}
      onMouseOver={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {icon}

      {hasMenu ? (
        <Portal>
          <div
            className={cn(
              "pointer-events-none fixed py-1 opacity-0",
              "z-20 pb-10 transition-opacity duration-300",
              {
                "pointer-events-auto opacity-100": showMenu,
              }
            )}
            ref={el => el && el !== menuEl && setMenuEl(el)}
            style={{ ...styles.popper }}
            {...attributes.popper}
            onMouseOver={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div
              className={cn(
                "flex flex-col space-y-2 rounded-full px-4 py-4",
                "bg-gray-800/75 text-gray-200 backdrop-blur"
              )}
            >
              {children}
            </div>
          </div>
        </Portal>
      ) : (
        children
      )}
    </div>
  )
}

export default ToolbarButton

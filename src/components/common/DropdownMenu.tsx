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

import React, { Fragment, useEffect, useRef, useState } from "react"
import classNames from "classnames"
import { Menu, Transition } from "@headlessui/react"

import classes from "@styles/components/common/DropdownMenu.module.scss"

export type DropdownMenuProps = {
  className?: string
  open?: boolean
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className, open }) => {
  const [style, setStyle] = useState<React.CSSProperties>({})
  const [menuEl, setMenuEl] = useState<HTMLDivElement>()

  useEffect(() => {
    const updateBounds = () => {
      if (!menuEl) return

      const parentRect = menuEl.offsetParent!.getBoundingClientRect()
      const offsetLeft = parentRect.left + menuEl.offsetLeft

      if (offsetLeft < 10) {
        setStyle({ transform: `translateX(${10 - offsetLeft}px)` })
      }
    }

    menuEl && updateBounds()

    const observer = new ResizeObserver(updateBounds)
    observer.observe(document.documentElement)

    return () => {
      observer.disconnect()
    }
  }, [menuEl])

  return (
    <Menu.Items
      as="div"
      className={classNames(classes.dropdownMenu, className, {
        [classes.open]: open
      })}
      style={style}
      ref={(el: HTMLDivElement | null) => el && setMenuEl(el)}
      static
    >
      {children}
    </Menu.Items>
  )
}

export default DropdownMenu

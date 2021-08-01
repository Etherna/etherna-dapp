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
import { Menu } from "@headlessui/react"
import classnames from "classnames"
import { Link } from "react-router-dom"

type DropdownItemProps = {
  href?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
  disabled?: boolean
  inactive?: boolean
  btnAs?: React.ElementType
  action?(): void
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  href = "#",
  icon,
  suffix,
  disabled,
  inactive,
  btnAs: BtnAs = "button",
  action
}) => {
  const handleAction = (e: MouseEvent) => {
    if (action || href === "#") {
      e.preventDefault()
      e.stopPropagation()

      action?.()

      return false
    }
  }

  return (
    <Menu.Item as="div" disabled={disabled || inactive}>
      {({ active }) => {
        const className = classnames("dropdown-item", {
          active: active && !inactive,
          disabled,
          inactive,
        })

        const content = (
          <>
            {icon && (
              <div className="dropdown-item-icon">
                {icon}
              </div>
            )}

            {children}

            {suffix && (
              <div className="dropdown-item-suffix">
                {suffix}
              </div>
            )}
          </>
        )

        if (href === "#") {
          return <BtnAs
            className={className}
            onClick={(e: React.MouseEvent) => handleAction(e.nativeEvent)}>
            {content}
          </BtnAs>
        }

        return (
          <Link
            to={href}
            className={className}
            onClick={e => handleAction(e.nativeEvent)}>
            {content}
          </Link>
        )
      }}
    </Menu.Item>
  )
}

export default DropdownItem

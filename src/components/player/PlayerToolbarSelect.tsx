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

import React, { useRef, useState } from "react"
import { Listbox } from "@headlessui/react"
import classNames from "classnames"

import classes from "@/styles/components/player/PlayerToolbarSelect.module.scss"

import { isTouchDevice } from "@/utils/browser"

type PlayerToolbarSelectProps = {
  children?: React.ReactNode
  value: string
  options: { value: string, label: string }[]
  onSelect?(optionValue?: string | { value: string } | undefined): void
}

const PlayerToolbarSelect: React.FC<PlayerToolbarSelectProps> = ({
  children,
  value,
  options,
  onSelect,
}) => {
  const [isTouch] = useState(isTouchDevice())
  const toggleEl = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    const toggle = toggleEl.current
    const isOpen = toggle?.ariaExpanded === "true"

    !isOpen && toggleEl.current?.click()
  }

  const toggleExit = () => {
    const toggle = toggleEl.current
    const isOpen = toggle?.ariaExpanded === "true"

    isOpen && toggleEl.current?.click()
  }

  return (
    <div
      className={classes.playerToolbarSelect}
      onMouseEnter={!isTouch ? toggleOpen : undefined}
      onMouseLeave={!isTouch ? toggleExit : undefined}
    >
      <Listbox value={value} onChange={val => onSelect?.(val)}>
        {({ open }) => (
          <>
            <Listbox.Button
              as="div"
              role="button"
              className={classes.playerToolbarSelectBtn}
              ref={toggleEl}
            >
              {children}
            </Listbox.Button>

            <div className={classNames(classes.playerToolbarSelectList, {
              [classes.open]: open,
            })}>
              <Listbox.Options className={classes.playerToolbarSelectListMenu} static>
                {options.map(option => (
                  <Listbox.Option
                    className={classNames(classes.playerToolbarSelectListItem, {
                      [classes.active]: option.value === value
                    })}
                    key={option.value}
                    value={option}
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}

export default PlayerToolbarSelect

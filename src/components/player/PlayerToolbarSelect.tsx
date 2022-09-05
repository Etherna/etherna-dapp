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

import { isTouchDevice } from "@/utils/browser"

type PlayerToolbarSelectProps = {
  children?: React.ReactNode
  value: string
  options: { value: string; label: string }[]
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
      className="relative"
      onMouseEnter={!isTouch ? toggleOpen : undefined}
      onMouseLeave={!isTouch ? toggleExit : undefined}
    >
      <Listbox value={value} onChange={val => onSelect?.(val)}>
        {({ open }) => (
          <>
            <Listbox.Button
              as="div"
              role="button"
              className={classNames(
                "h-5 px-1.5 md:h-7 md:px-3 rounded flex items-center",
                "text-gray-200 text-xs font-semibold text-center",
                "bg-gray-500/50 backdrop-blur"
              )}
              ref={toggleEl}
            >
              {children}
            </Listbox.Button>

            <div
              className={classNames(
                "ml-0 invisible opacity-0 absolute left-1/2 bottom-0",
                "transform -translate-x-1/2 pb-10  z-20",
                {
                  "visible opacity-100 transition-opacity duration-200": open,
                }
              )}
            >
              <Listbox.Options
                className={classNames(
                  "flex flex-col px-2 py-4 space-y-2 rounded",
                  "bg-gray-800/75 text-gray-200 backdrop-blur"
                )}
                static
              >
                {options.map(option => (
                  <Listbox.Option
                    className={classNames(
                      "cursor-pointer px-2 text-sm text-center font-semibold focus:outline-none",
                      {
                        "text-primary-500": option.value === value,
                      }
                    )}
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

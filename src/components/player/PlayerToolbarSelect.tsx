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
import { Listbox } from "@headlessui/react"

import { isTouchDevice } from "@/utils/browser"
import classNames from "@/utils/classnames"

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
  const toggleEl = useRef<HTMLButtonElement>(null)

  const toggleOpen = useCallback(() => {
    const toggle = toggleEl.current
    const isOpen = toggle?.ariaExpanded === "true"

    !isOpen && toggleEl.current?.click()
  }, [])

  const toggleExit = useCallback(() => {
    const toggle = toggleEl.current
    const isOpen = toggle?.ariaExpanded === "true"

    isOpen && toggleEl.current?.click()
  }, [])

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
                "flex h-5 items-center rounded px-1.5 md:h-7 md:px-3",
                "text-center text-xs font-semibold text-gray-200",
                "bg-gray-500/50 backdrop-blur"
              )}
              ref={toggleEl}
            >
              {children}
            </Listbox.Button>

            <div
              className={classNames(
                "absolute left-1/2 bottom-0 ml-0",
                "z-20 -translate-x-1/2 transform pb-10",
                {
                  "invisible opacity-0": !open,
                  "visible opacity-100 transition-opacity duration-200": open,
                }
              )}
            >
              <Listbox.Options
                className={classNames(
                  "flex flex-col space-y-2 rounded px-2 py-4",
                  "bg-gray-800/75 text-gray-200 backdrop-blur"
                )}
                static
              >
                {options.map(option => (
                  <Listbox.Option
                    className={classNames(
                      "cursor-pointer px-2 text-center text-sm font-semibold focus:outline-none",
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

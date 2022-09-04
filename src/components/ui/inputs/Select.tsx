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
import React, { Fragment, useCallback, useMemo } from "react"

import { Listbox, Transition } from "@headlessui/react"
import classNames from "classnames"

import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid"

export type Option = {
  label: string | JSX.Element
  value: string
  description?: string
  disabled?: boolean
}

export type SelectProps = {
  label?: string
  value: string | null | undefined
  options: Option[]
  selectedRender?: React.ReactNode
  disabled?: boolean
  onChange?(value: string): void
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  selectedRender,
  disabled,
  onChange,
}) => {
  const currentOption = useMemo(() => options.find(opt => opt.value === value), [value, options])

  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val)
    },
    [onChange]
  )

  return (
    <Listbox value={value} onChange={handleChange} disabled={disabled} data-component="select">
      {({ open }) => (
        <>
          <div
            className={classNames("relative", {
              "opacity-50 pointer-events-none cursor-default": disabled,
            })}
          >
            <div className="inline-flex items-center rounded-md border border-gray-500 dark:border-gray-400">
              {label && (
                <span className="text-sm mx-2 text-gray-600 dark:text-gray-300">{label}</span>
              )}
              {selectedRender && <div className="inline">{selectedRender}</div>}
              <Listbox.Button
                className={classNames(
                  "relative inline-flex items-center bg-transparent p-2 rounded-md",
                  "text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-500/5",
                  "transition-colors duration-200"
                )}
              >
                {!selectedRender && currentOption?.label}
                <ChevronDownIcon
                  className={classNames(
                    "h-5 w-6 ml-3 pl-1",
                    "text-gray-900 dark:text-gray-100 border-l border-gray-500 dark:border-gray-400"
                  )}
                  aria-hidden
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={classNames(
                  "absolute origin-top-left left-0 mt-2 w-72 rounded-md shadow-lg",
                  "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 divide-y",
                  "divide-gray-200 dark:divide-gray-700 ring-1 ring-black/5",
                  "focus:outline-none z-10"
                )}
                static
              >
                {options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classNames(
                        "cursor-default select-none relative p-4 text-sm text-gray-900 dark:text-gray-100",
                        {
                          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50": active,
                        }
                      )
                    }
                    value={option.value}
                  >
                    {({ active, selected }) => (
                      <div className="flex flex-col">
                        <div
                          className={classNames("flex justify-between text-base font-semibold", {
                            "font-semibold": selected,
                            "text-gray-900 dark:text-gray-50": active,
                          })}
                        >
                          <span>{option.label}</span>

                          {selected ? <CheckIcon width={20} aria-hidden /> : null}
                        </div>

                        {option.description && (
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default Select

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

import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid"

import classNames from "@/utils/classnames"

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
              "pointer-events-none cursor-default opacity-50": disabled,
            })}
          >
            <div className="inline-flex items-center rounded-md border border-gray-500 dark:border-gray-400">
              {label && (
                <span className="mx-2 text-sm text-gray-600 dark:text-gray-300">{label}</span>
              )}
              {selectedRender && <div className="inline">{selectedRender}</div>}
              <Listbox.Button
                className={classNames(
                  "relative inline-flex items-center rounded-md bg-transparent px-2 py-1.5",
                  "text-sm font-medium text-gray-900 hover:bg-gray-500/5 dark:text-gray-100",
                  "transition-colors duration-200"
                )}
              >
                {!selectedRender && currentOption?.label}
                <ChevronDownIcon
                  className={classNames(
                    "ml-3 h-5 w-6 pl-1",
                    "border-l border-gray-500 text-gray-900 dark:border-gray-400 dark:text-gray-100"
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
                  "absolute left-0 mt-2 w-72 origin-top-left rounded-md shadow-lg",
                  "divide-y border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
                  "divide-gray-200 ring-1 ring-black/5 dark:divide-gray-700",
                  "z-10 focus:outline-none"
                )}
                static
              >
                {options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classNames(
                        "relative cursor-default select-none p-4 text-sm text-gray-900 dark:text-gray-100",
                        {
                          "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50": active,
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
                          <p className="mt-0.5 text-gray-500 dark:text-gray-400">
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

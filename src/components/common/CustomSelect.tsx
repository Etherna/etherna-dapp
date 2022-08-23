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

import React, { Fragment, useMemo } from "react"
import { Listbox, Transition } from "@headlessui/react"
import classNames from "classnames"

import classes from "@/styles/components/common/CustomSelect.module.scss"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid"

type Option = {
  label: string | JSX.Element
  value: string
  description?: string
  disabled?: boolean
}

type CustomSelectProps = {
  label?: string
  value: string | null | undefined
  options: Option[]
  selectedRender?: React.ReactNode
  disabled?: boolean
  onChange?(value: string): void
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  selectedRender,
  disabled,
  onChange
}) => {
  const currentOption = useMemo(
    () => options.find(opt => opt.value === value),
    [value, options]
  )

  const handleChange = (val: string) => {
    onChange?.(val)
  }

  return (
    <Listbox value={value} onChange={handleChange} disabled={disabled}>
      {({ open }) => (
        <>
          <div className={classNames(classes.customSelect, {
            [classes.disabled]: disabled
          })}>
            <div className={classes.customSelectButton}>
              {label && (
                <span className={classes.customSelectLabel}>{label}</span>
              )}
              {selectedRender && (
                <div className={classes.customSelectValue}>{selectedRender}</div>
              )}
              <Listbox.Button className={classes.customSelectDropdown}>
                {!selectedRender && (
                  currentOption?.label
                )}
                <ChevronDownIcon aria-hidden />
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
                className={classes.customSelectOptionsList}
                static
              >
                {options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active, selected }) => classNames(classes.customSelectOption, {
                      [classes.active]: active,
                      [classes.selected]: selected,
                    })}
                    value={option.value}
                  >
                    {({ selected }) => (
                      <div className={classes.customSelectOptionContent}>
                        <div className={classes.customSelectOptionTitle}>
                          <span>{option.label}</span>

                          {selected ? (
                            <span className={classes.customSelectOptionCheckIcon}>
                              <CheckIcon aria-hidden />
                            </span>
                          ) : null}
                        </div>

                        {option.description && (
                          <p className={classes.customSelectOptionDescription}>
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

export default CustomSelect

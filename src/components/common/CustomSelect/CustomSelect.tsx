import React, { Fragment, useMemo } from "react"
import { Listbox, Transition } from "@headlessui/react"

import "./custom-select.scss"
import { ReactComponent as CheckIcon } from "@svg/icons/check.svg"
import { ReactComponent as ChevronDownIcon } from "@svg/icons/chevron-down.svg"
import classNames from "classnames"

type Option = {
  label: string | JSX.Element
  value: string
  description?: string
  disabled?: boolean
}

type CustomSelectProps = {
  value: string | null | undefined
  options: Option[]
  selectedRender?: React.ReactNode
  disabled?: boolean
  onChange?(value: string): void
}

const CustomSelect: React.FC<CustomSelectProps> = ({
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
    console.log(val)
    onChange?.(val)
  }

  return (
    <Listbox value={value} onChange={handleChange} disabled={disabled}>
      {({ open }) => (
        <>
          <div className={classNames("custom-select", { disabled })}>
            <div className="custom-select-button">
              {selectedRender && (
                <div className="custom-select-value">{selectedRender}</div>
              )}
              <Listbox.Button className="custom-select-dropdown">
                {!selectedRender && (
                  currentOption?.label
                )}
                <ChevronDownIcon aria-hidden="true" />
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
                static
                className="custom-select-options-list"
              >
                {options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active, selected }) => classNames("custom-select-option", {
                      active,
                      selected
                    })}
                    value={option.value}
                  >
                    {({ selected }) => (
                      <div className="custom-select-option-content">
                        <div className="custom-select-option-title">
                          <span>{option.label}</span>

                          {selected ? (
                            <span className="custom-select-option-check-icon">
                              <CheckIcon aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>

                        {option.description && (
                          <p className="custom-select-option-description">
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

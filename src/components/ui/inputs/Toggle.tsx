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

import React, { useCallback, useMemo } from "react"
import { Switch } from "@headlessui/react"
import classNames from "classnames"

export type ToggleProps = {
  className?: string
  label?: string
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
  checked: boolean
  disabled?: boolean
  onChange(checked: boolean): void
}

const Toggle: React.FC<ToggleProps> = ({
  className,
  label,
  checkedIcon,
  uncheckedIcon,
  checked,
  disabled,
  onChange,
}) => {
  const styledIcon = useCallback((icon: React.ReactElement) => {
    return icon
      ? React.cloneElement(icon, {
          className: classNames("w-3.5 h-3.5 m-0", icon.props.className),
        })
      : undefined
  }, [])

  const styledCheckedIcon = useMemo(() => {
    return styledIcon(checkedIcon as React.ReactElement)
  }, [checkedIcon, styledIcon])

  const styledUncheckedIcon = useMemo(() => {
    return styledIcon(uncheckedIcon as React.ReactElement)
  }, [uncheckedIcon, styledIcon])

  return (
    <Switch.Group>
      <div className={classNames("flex items-center", className)} data-component="toggle">
        {label && <Switch.Label className="mr-4">{label}</Switch.Label>}
        <Switch
          checked={checked}
          onChange={onChange}
          className={classNames(
            "relative inline-flex h-4 w-11 items-center rounded-full transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-4 focus-visible:outline-none",
            "focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800",
            {
              "bg-gray-200 dark:bg-gray-700": !checked,
              "bg-primary-500": checked,
            }
          )}
          disabled={disabled}
        >
          <span
            className={classNames(
              "flex h-6 w-6 items-center justify-center",
              "rounded-full bg-white text-gray-600",
              "border border-gray-200 dark:border-gray-700",
              "translate-x-0 transform transition-transform duration-200 ease-in-out",
              {
                "translate-x-5": checked,
              }
            )}
          >
            {checked && styledCheckedIcon}
            {!checked && styledUncheckedIcon}
          </span>
        </Switch>
      </div>
    </Switch.Group>
  )
}

export default Toggle

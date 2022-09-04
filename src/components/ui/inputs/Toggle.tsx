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
  onChange(checked: boolean): void
}

const Toggle: React.FC<ToggleProps> = ({
  className,
  label,
  checkedIcon,
  uncheckedIcon,
  checked,
  onChange,
}) => {
  const styledIcon = useCallback((icon: React.ReactElement) => {
    return React.cloneElement(icon, {
      className: "w-4 h-4 m-0",
    })
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
            "relative inline-flex items-center h-4 w-11 rounded-full transition-colors",
            "bg-gray-200 dark:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
            {
              "bg-green-500": checked,
            }
          )}
        >
          <span
            className={classNames(
              "flex items-center justify-center w-6 h-6",
              "bg-white rounded-full text-gray-400",
              "border border-gray-200 dark:border-gray-700",
              "transform translate-x-0 transition-transform ease-in-out duration-200",
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

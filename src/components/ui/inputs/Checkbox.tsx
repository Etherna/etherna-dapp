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

import { Label } from "@/components/ui/display"
import classNames from "@/utils/classnames"

export type CheckboxProps = {
  id?: string
  className?: string
  inputClassName?: string
  checked?: boolean
  label?: string
  disabled?: boolean
  onChange?(value: boolean): void
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  className,
  inputClassName,
  checked,
  label,
  disabled,
  onChange,
}) => {
  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={classNames("relative", className)}>
        <input
          id={id}
          className={classNames(
            "rounded-md p-0.5",
            "bg-gray-200 text-primary-600 dark:bg-gray-700",
            "border-gray-300 dark:border-gray-600",
            "checked:border-primary-600 checked:bg-primary-600 checked:dark:border-primary-600 checked:dark:bg-primary-600",
            "focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900",
            inputClassName
          )}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange?.(e.target.checked)}
          data-component="checkbox"
        />
      </div>
    </>
  )
}

export default Checkbox

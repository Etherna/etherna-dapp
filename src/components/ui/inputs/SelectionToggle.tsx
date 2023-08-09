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
import { Switch } from "@headlessui/react"

import { CheckIcon } from "@heroicons/react/24/solid"

import { Spinner } from "@/components/ui/display"
import { cn } from "@/utils/classnames"

export type SelectionToggleProps = {
  className?: string
  label?: string
  description?: string
  checked: boolean
  loading?: boolean
  disabled?: boolean
  onChange(checked: boolean): void
}

const SelectionToggle: React.FC<SelectionToggleProps> = ({
  className,
  label,
  description,
  checked,
  loading,
  disabled,
  onChange,
}) => {
  return (
    <Switch.Group>
      <Switch
        checked={checked}
        onChange={onChange}
        className={cn(
          "flex items-start rounded-lg border p-2",
          {
            "border-gray-400 hover:border-sky-300 dark:border-gray-600 dark:hover:border-sky-700":
              !checked,
            "border-sky-500 dark:border-sky-500": checked,
          },
          className
        )}
        disabled={disabled}
        data-component="selection-toggle"
      >
        <div className="flex-w-5 h-5 shrink-0">
          {loading ? (
            <Spinner size={20} />
          ) : (
            <div
              className={cn("flex h-5 w-5 rounded-md border p-0.5", {
                "border-gray-400 dark:border-gray-600": !checked,
                "border-sky-500 text-sky-500 dark:border-sky-500": checked,
              })}
            >
              {checked && (
                <CheckIcon className="h-full w-full stroke-current stroke-[2px]" aria-hidden />
              )}
            </div>
          )}
        </div>

        <div className="ml-3 flex flex-grow flex-col text-left">
          {label && (
            <Switch.Label
              className={cn(
                "text-base font-semibold leading-tight text-gray-800 dark:text-gray-200",
                "max-w-full flex-grow cursor-pointer overflow-hidden text-ellipsis"
              )}
            >
              {label}
            </Switch.Label>
          )}
          {description && (
            <Switch.Description
              className={cn(
                "text-ellipsis text-sm leading-tight text-gray-600 dark:text-gray-400",
                "max-w-full flex-grow overflow-hidden"
              )}
            >
              {description}
            </Switch.Description>
          )}
        </div>
      </Switch>
    </Switch.Group>
  )
}

export default SelectionToggle

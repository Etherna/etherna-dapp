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
import { RadioGroup } from "@headlessui/react"
import classNames from "classnames"

import { CheckCircleIcon } from "@heroicons/react/24/solid"

import type { ExtensionParamConfig } from "./ExtensionHostPanel"
import { TextInput } from "@/components/ui/inputs"

type ExtensionHostPanelParamProps = {
  value: string
  paramConfig: ExtensionParamConfig
  valueClassName?: string
  onChange(val: string): void
}

const ExtensionHostPanelParam: React.FC<ExtensionHostPanelParamProps> = ({
  value,
  paramConfig,
  onChange,
}) => {
  switch (paramConfig.type ?? "text") {
    case "text":
      return (
        <TextInput
          id={paramConfig.key}
          type="text"
          value={value}
          onChange={onChange}
          autoFocus
          small
        />
      )
    case "gatetype":
      return (
        <RadioGroup className="flex flex-col space-y-1.5" value={value} onChange={onChange}>
          {paramConfig.options?.map(config => (
            <RadioGroup.Option value={config.value} key={config.value}>
              {({ active, checked }) => (
                <div
                  className={classNames(
                    "flex items-start justify-between",
                    "border border-gray-400 dark:border-gray-400",
                    "cursor-pointer rounded-md px-2.5 py-2",
                    {
                      "border-gray-900 dark:border-gray-100": active,
                      "border-primary-500 ring-2 ring-primary-500 hover:border-primary-500":
                        checked,
                    }
                  )}
                >
                  <div className="flex flex-col">
                    <RadioGroup.Label className="mb-0 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {config.label}
                    </RadioGroup.Label>
                    <RadioGroup.Description className="whitespace-pre-line text-xs leading-tight text-gray-600 dark:text-gray-400">
                      {config.description}
                    </RadioGroup.Description>
                  </div>
                  {checked && (
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-3xl text-primary-500" />
                  )}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      )
  }
}

export default ExtensionHostPanelParam

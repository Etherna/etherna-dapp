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

import classes from "@/styles/components/env/ExtensionHostPanelParam.module.scss"
import { CheckCircleIcon } from "@heroicons/react/solid"

import TextField from "@/components/common/TextField"
import type { ExtensionParamConfig } from "./ExtensionHostPanel"
import classNames from "classnames"

type ExtensionHostPanelParamProps = {
  value: string
  paramConfig: ExtensionParamConfig
  isEditing: boolean
  valueClassName?: string
  onChange(val: string): void
}

const ExtensionHostPanelParam: React.FC<ExtensionHostPanelParamProps> = ({
  value,
  valueClassName,
  paramConfig,
  isEditing,
  onChange,
}) => {
  if (isEditing) {
    switch (paramConfig.type ?? "text") {
      case "text":
        return (
          <TextField
            id={paramConfig.key}
            type="text"
            value={value}
            onChange={onChange}
            autoFocus
          />
        )
      case "radio":
        return (
          <RadioGroup className={classes.radioGroup} value={value} onChange={onChange}>
            {paramConfig.options?.map(config => (
              <RadioGroup.Option value={config.value} key={config.value}>
                {({ active, checked }) => (
                  <div
                    className={classNames(classes.radio, {
                      [classes.active]: active,
                    })}
                  >
                    <div className={classes.radioContent}>
                      <RadioGroup.Label>{config.label}</RadioGroup.Label>
                      <RadioGroup.Description>{config.description}</RadioGroup.Description>
                    </div>
                    {checked && (
                      <CheckCircleIcon className={classes.radioCheck} />
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )
    }
  }

  switch (paramConfig.type ?? "text") {
    case "text":
      return (
        <div className={valueClassName}>{value}</div>
      )
    case "radio":
      return (
        <div className={valueClassName}>{paramConfig.options?.find(opt => opt.value === value)?.label}</div>
      )
  }
}

export default ExtensionHostPanelParam

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

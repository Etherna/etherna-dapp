import React from "react"
import { Switch } from "@headlessui/react"
import classnames from "classnames"

import "./toggle.scss"

type ToggleProps = {
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
  onChange
}) => {
  return (
    <Switch.Group>
      <div className={classnames("toggle", className)}>
        {label && (
          <Switch.Label className="toggle-label">Enable notifications</Switch.Label>
        )}
        <Switch
          checked={checked}
          onChange={onChange}
          className={classnames("toggle-control", { on: checked })}
        >
          <span className={classnames("toggle-knob", { on: checked })}>
            {checked && checkedIcon}
            {!checked && uncheckedIcon}
          </span>
        </Switch>
      </div>
    </Switch.Group>
  )
}

export default Toggle

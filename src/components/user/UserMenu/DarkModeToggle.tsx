import React from "react"

import { ReactComponent as DarkModeIcon } from "@svg/icons/dark-mode-icon.svg"
import { ReactComponent as LightModeIcon } from "@svg/icons/light-mode-icon.svg"

import Toggle from "@common/Toggle"

type DarkModeToggleProps = {
  enabled: boolean
  onChange(enabled: boolean): void
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ enabled, onChange }) => {
  return (
    <div className="flex w-full items-center">
      <DarkModeIcon />
      <span>Dark Mode</span>
      <Toggle
        className="ml-auto"
        checkedIcon={<DarkModeIcon className="ml-1.5 p-0.5" />}
        uncheckedIcon={<LightModeIcon className="ml-1.5 p-0.5" />}
        checked={enabled}
        onChange={onChange}
      />
    </div>
  )
}

export default DarkModeToggle

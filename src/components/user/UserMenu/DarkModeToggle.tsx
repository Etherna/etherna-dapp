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
      Dark Mode

      <Toggle
        className="ml-auto"
        checkedIcon={<DarkModeIcon />}
        uncheckedIcon={<LightModeIcon />}
        checked={enabled}
        onChange={onChange}
      />
    </div>
  )
}

export default DarkModeToggle

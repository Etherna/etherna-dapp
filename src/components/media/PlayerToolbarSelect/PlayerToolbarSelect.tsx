import React from "react"
import { Listbox } from "@headlessui/react"
import classNames from "classnames"

import "./player-toolbar-select.scss"

type PlayerToolbarSelectProps = {
  value: string
  options: { value: string, label: string }[]
  onSelect?(optionValue?: string | { value: string } | undefined): void
}

const PlayerToolbarSelect: React.FC<PlayerToolbarSelectProps> = ({
  children,
  value,
  options,
  onSelect
}) => {
  return (
    <div className="player-toolbar-select">
      <Listbox value={value} onChange={val => onSelect?.(val)}>
        <Listbox.Button as="div" role="button" className="player-toolbar-select-btn">
          {children}
        </Listbox.Button>

        <div className="player-toolbar-select-list">
          <Listbox.Options className="player-toolbar-select-list-menu" static>
            {options.map(option => (
              <Listbox.Option
                className={classNames("player-toolbar-select-list-item", {
                  active: option.value === value
                })}
                key={option.value}
                value={option}
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  )
}

export default PlayerToolbarSelect

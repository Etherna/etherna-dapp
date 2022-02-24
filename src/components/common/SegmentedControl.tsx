import React from "react"
import Tippy from "@tippyjs/react"

import classes from "@styles/components/common/SegmentedControl.module.scss"

type SegmentedControlProps = {
  entries: Array<{ value: string, label: string, tip?: string }>
  value: string
  defaultValue: string
  name?: string
  onChange?(val: string): void
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  entries,
  value,
  defaultValue,
  name,
  onChange,
}) => {
  return (
    <div className={classes.segmentedControl}>
      {entries.map(entry => (
        <React.Fragment key={entry.value}>
          <input
            type="radio"
            name={name}
            value={entry.value}
            id={`entry-${name}-${entry.value}`}
            checked={value ? entry.value === value : entry.value === defaultValue}
            onChange={() => onChange?.(entry.value)}
          />
          <Tippy
            className="chart-toolbar-tippy"
            allowHTML={true}
            delay={150}
            placement="top"
            content={entry.tip}
          >
            <label htmlFor={`entry-${name}-${entry.value}`}>
              {entry.label}
            </label>
          </Tippy>
        </React.Fragment>
      ))}
    </div>
  )
}

export default SegmentedControl

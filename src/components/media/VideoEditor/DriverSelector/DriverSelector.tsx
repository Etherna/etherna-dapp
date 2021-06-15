import React from "react"
import { useVideoEditorState } from "../context"

import "./driver-selector.scss"

type DriverSelectorProps = {

}

const DriverOptions: Record<string, string> = {
  swarm: "Swarm",
  fairos: "Fairos",
}

const DriverSelector: React.FC<DriverSelectorProps> = ({ }) => {
  const { state, actions } = useVideoEditorState()
  const { driver } = state
  const { changeDriver } = actions

  const onChange = (driver: string) => {
    changeDriver(driver as any)
  }

  return (
    <div className="driver-selector-wrapper">
      <label htmlFor="driver">Driver</label>
      <label htmlFor="driver" className="driver-selector">
        <select className="driver-selector-input" id="driver" value={driver} onChange={e => onChange(e.target.value)}>
          {Object.keys(DriverOptions).map((value) => (
            <option value={value} key={value}>{DriverOptions[value]}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default DriverSelector

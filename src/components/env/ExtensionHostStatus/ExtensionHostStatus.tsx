import React from "react"
import classNames from "classnames"

import "./extension-host-status.scss"

import { urlHostname } from "@utils/urls"

type ExtensionHostStatusProps = {
  title: string
  host: string
  isConnected: boolean | undefined
  iconSvg?: React.ReactNode
  compactMobile?: boolean
  onClick?(): void
}

const ExtensionHostStatus: React.FC<ExtensionHostStatusProps> = ({ title, host, isConnected, iconSvg, compactMobile, onClick }) => {
  return (
    <div className={classNames("extension-host-status", { "compact-mobile": compactMobile })} onClick={onClick}>
      {iconSvg && (
        <span className="extension-host-status-icon">
          {iconSvg}
        </span>
      )}

      <div className="extension-host-status-detail">
        <span className="extension-host-status-title">{title}</span>
        <span className="extension-host-status-host">{urlHostname(host)}</span>
      </div>

      <span className={classNames("extension-host-status-preview", { active: isConnected })}></span>
    </div>
  )
}

export default ExtensionHostStatus

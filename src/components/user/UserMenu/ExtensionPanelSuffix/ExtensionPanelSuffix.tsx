import React from "react"
import classnames from "classnames"

import "./extension-panel-suffix.scss"

type ExtensionPanelSuffixProps = {
  active: boolean
}

const ExtensionPanelSuffix: React.FC<ExtensionPanelSuffixProps> = ({ active }) => {
  return (
    <div className="extension-panel-suffix">
      <span className={classnames("extension-panel-suffix-status", { active })} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="extension-panel-suffix-icon"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          // eslint-disable-next-line max-len
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

export default ExtensionPanelSuffix

import React, { useState } from "react"
import classnames from "classnames"

import "./progress-tab.scss"

import ProgressTabContent, { ProgressTabContentProps } from "./ProgressTabContent"
import ProgressTabLink, { ProgressTabLinkProps } from "./ProgressTabLink"

type ProgressTabProps = {
  defaultKey: string
  id?: string
  className?: string
}

type RFCE<P> = React.FunctionComponentElement<P>

const ProgressTab: React.FC<ProgressTabProps> = ({
  children,
  defaultKey,
  id,
  className,
}) => {
  const [activeKey, setActiveKey] = useState(defaultKey)

  const links = React.Children.toArray(children)
    .filter((child: any) => child.type.name === "ProgressTabLink") as RFCE<ProgressTabLinkProps>[]
  const contents = React.Children.toArray(children)
    .filter((child: any) => child.type.name === "ProgressTabContent") as RFCE<ProgressTabContentProps>[]

  return (
    <div className={classnames("progresstab", className)} id={id}>
      <nav className="progresstab-nav">
        {links.map(child => (
          <ProgressTabLink
            {...child.props}
            active={activeKey === child.props.tabKey}
            onSelect={setActiveKey}
            key={child.props.tabKey}
          />
        ))}
      </nav>

      <div className="progresstab-content-wrapper">
        {contents.map(child => (
          <ProgressTabContent
            {...child.props}
            active={activeKey === child.props.tabKey}
            key={child.props.tabKey}
          />
        ))}
      </div>
    </div>
  )
}

export default ProgressTab

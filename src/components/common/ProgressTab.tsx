/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useState } from "react"
import classNames from "classnames"

import classes from "@/styles/components/common/ProgressTab.module.scss"

import ProgressTabContent, { ProgressTabContentProps } from "./ProgressTabContent"
import ProgressTabLink, { ProgressTabLinkProps } from "./ProgressTabLink"

type ProgressTabProps = {
  children?: React.ReactNode
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
    .filter((child: any) => child.type.displayName === "ProgressTabLink") as RFCE<ProgressTabLinkProps>[]
  const contents = React.Children.toArray(children)
    .filter((child: any) => child.type.displayName === "ProgressTabContent") as RFCE<ProgressTabContentProps>[]

  return (
    <div className={classNames(classes.progresstab, className)} id={id}>
      <nav className={classes.progresstabNav}>
        {links.map(child => (
          <ProgressTabLink
            {...child.props}
            active={activeKey === child.props.tabKey}
            onSelect={setActiveKey}
            key={child.props.tabKey}
          />
        ))}
      </nav>

      <div className={classes.progresstabContentWrapper}>
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

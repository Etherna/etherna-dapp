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

import classes from "@styles/components/common/Tab.module.scss"

import TabContent, { TabContentProps } from "./TabContent"

type TabProps = {
  children: React.FunctionComponentElement<TabContentProps>[]
  defaultKey: string
  id?: string
  className?: string
  canAddRemoveTabs?: boolean
  onTabAdded?: () => void
  onTabRemoved?: (index: number) => void
  canRemoveTab?: (index: number) => boolean
}

const Tab = ({
  children,
  defaultKey,
  id,
  className,
  canAddRemoveTabs,
  onTabAdded,
  onTabRemoved,
  canRemoveTab,
}: TabProps) => {
  const [activeKey, setActiveKey] = useState(defaultKey)

  const handleAddTab = () => {
    onTabAdded && onTabAdded()
  }

  const handleRemoveTab = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    setActiveKey(defaultKey)
    onTabRemoved && onTabRemoved(index)
  }

  return (
    <div className={classNames(classes.tab, className)} id={id}>
      <nav className={classes.tabNav}>
        {React.Children.map(children, (tab, i) => (
          <a
            className={classNames(classes.tabNavLink, {
              active: activeKey === tab.props.tabKey,
            })}
            onClick={() => setActiveKey(tab.props.tabKey)}
          >
            {tab.props.title}
            {canAddRemoveTabs && (
              <>
                {(!canRemoveTab || (canRemoveTab && canRemoveTab(i))) && (
                  <button className={classes.tabLinkRemove} onClick={e => handleRemoveTab(e, i)}>
                    -
                  </button>
                )}
              </>
            )}
          </a>
        ))}
        {canAddRemoveTabs && (
          <a className={classNames(classes.tabNavLink, classes.tabLinkAdd)} onClick={handleAddTab}>
            +
          </a>
        )}
      </nav>
      <div className={classes.tabContents}>
        {React.Children.map(children, tab => (
          <TabContent {...tab.props} active={activeKey === tab.props.tabKey} />
        ))}
      </div>
    </div>
  )
}

export default Tab

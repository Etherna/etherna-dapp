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
import classnames from "classnames"

import "./tab.scss"

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
    <div className={classnames("tab", className)} id={id}>
      <nav className="tab-nav">
        {React.Children.map(children, (tab, i) => (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            className={classnames("tab-nav-link", {
              active: activeKey === tab.props.tabKey,
            })}
            onClick={() => setActiveKey(tab.props.tabKey)}
          >
            {tab.props.title}
            {canAddRemoveTabs && (
              <>
                {(!canRemoveTab || (canRemoveTab && canRemoveTab(i))) && (
                  <button className="tab-link-remove" onClick={e => handleRemoveTab(e, i)}>
                    -
                  </button>
                )}
              </>
            )}
          </a>
        ))}
        {canAddRemoveTabs && (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a className="tab-nav-link tab-link-add" onClick={handleAddTab}>
            +
          </a>
        )}
      </nav>
      <div className="tab-contents">
        {React.Children.map(children, tab => (
          <TabContent {...tab.props} active={activeKey === tab.props.tabKey} />
        ))}
      </div>
    </div>
  )
}

export default Tab

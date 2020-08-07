import React, { useState } from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./tab.scss"

import TabContent from "./TabContent"

const Tab = ({
    children,
    defaultKey,
    id,
    className,
    canAddRemoveTabs,
    onTabAdded,
    onTabRemoved,
    canRemoveTab
}) => {
    const [activeKey, setActiveKey] = useState(defaultKey)

    const handleAddTab = () => {
        onTabAdded && onTabAdded()
    }

    const handleRemoveTab = (e, index) => {
        e.preventDefault()
        e.stopPropagation()

        setActiveKey(defaultKey)
        onTabRemoved && onTabRemoved(index)
    }

    return (
        <div className={classnames("tab", className)} id={id}>
            <nav className="tab-nav">
                {
                    React.Children.map(children, (tab, i) => (
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a
                            className={classnames("tab-nav-link", {
                                "active": activeKey === tab.props.tabKey
                            })}
                            onClick={() => setActiveKey(tab.props.tabKey)}
                        >
                            {tab.props.title}
                            {canAddRemoveTabs && (
                                <>
                                    {(!canRemoveTab || (canRemoveTab && canRemoveTab(i))) && (
                                        <button
                                            className="tab-link-remove"
                                            onClick={e => handleRemoveTab(e, i)}
                                        >-</button>
                                    )}
                                </>
                            )}
                        </a>
                    ))
                }
                {canAddRemoveTabs && (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a className="tab-nav-link tab-link-add" onClick={handleAddTab}>
                        +
                    </a>
                )}
            </nav>
            <div className="tab-contents">
                {
                    React.Children.map(children, tab => (
                        <TabContent {...tab.props} active={activeKey === tab.props.tabKey} />
                    ))
                }
            </div>
        </div>
    )
}

Tab.propTypes = {
    children: PropTypes.node.isRequired,
    defaultKey: PropTypes.string.isRequired,
    id: PropTypes.string,
    className: PropTypes.string,
    canAddRemoveTabs: PropTypes.bool,
    onTabAdded: PropTypes.func,
    onTabRemoved: PropTypes.func,
    canRemoveTab: PropTypes.func,
}

Tab.defaultProps = {
    canAddRemoveTabs: false
}

export default Tab
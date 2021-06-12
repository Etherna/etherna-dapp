import React from "react"
import classnames from "classnames"
import { Transition } from "@headlessui/react"

import "./sidebar.scss"

type SidebarProps = {
  floating?: boolean
  show?: boolean
  onClose?(): void
}

const Sidebar: React.FC<SidebarProps> = ({ children, floating, show, onClose }) => {
  return (
    <>
      {floating && (
        <Transition
          show={show}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="sidebar-backdrop" onClick={onClose}></div>
        </Transition>
      )}
      <aside className={classnames("sidebar", { floating, show })}>
        <div className="sidebar-container">
          {children}
        </div>
      </aside>
    </>
  )
}

export default Sidebar

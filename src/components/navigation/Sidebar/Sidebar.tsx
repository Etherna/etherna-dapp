import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import classnames from "classnames"
import { Transition } from "@headlessui/react"

import "./sidebar.scss"

type SidebarProps = {
  floating?: boolean
  show?: boolean
  onClose?(): void
}

const Sidebar: React.FC<SidebarProps> = ({ children, floating, show, onClose }) => {
  const location = useLocation()
  const sidebarRef = useRef<HTMLElement>(null)
  const [animateSlide, setAnimateSlide] = useState(show && floating)
  const [showSidebar, setShowSidebar] = useState(show)

  useEffect(() => {
    if (show && floating) {
      setAnimateSlide(true)
    }
    setShowSidebar(show)
  }, [show, floating])

  useEffect(() => {
    setAnimateSlide(false)
  }, [location])

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
      <aside
        className={classnames("sidebar", { floating, show: showSidebar, "animate-slide": animateSlide })}
        ref={sidebarRef}
      >
        <div className="sidebar-container">
          {children}
        </div>
      </aside>
    </>
  )
}

export default Sidebar

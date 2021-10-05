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

import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import classNames from "classnames"
import { Transition } from "@headlessui/react"

import classes from "@styles/components/navigation/Sidebar.module.scss"

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
        className={classNames(classes.sidebar, {
          [classes.floating]: floating,
          [classes.show]: showSidebar,
          [classes.animateSlide]: animateSlide
        })}
        ref={sidebarRef}
      >
        <div className={classes.sidebarContainer}>
          {children}
        </div>
      </aside>
    </>
  )
}

export default Sidebar

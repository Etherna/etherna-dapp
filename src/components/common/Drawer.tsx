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

import React from "react"
import { Fragment, useEffect, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import classNames from "classnames"

import classes from "@/styles/components/common/Drawer.module.scss"

type DrawerProps = {
  children: React.ReactNode
  className?: string
  show: boolean
  height?: string | number
  onDismiss?(): void
  onAnimationDone?(): void
}

const Drawer: React.FC<DrawerProps> = ({
  children,
  className,
  show,
  height,
  onDismiss,
  onAnimationDone,
}) => {
  const [isShown, setIsShown] = useState(show)

  useEffect(() => {
    setIsShown(show)
  }, [show])

  const handleClose = () => {
    setIsShown(false)
    onDismiss?.()
  }

  return (
    <Transition.Root
      show={isShown}
      as={Fragment}
      afterLeave={onAnimationDone}
    >
      <Dialog
        as="div"
        className={classNames(classes.drawer, className)}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className={classes.drawerOverlay} />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-20"
          enterTo="opacity-100 translate-y-0"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-20"
        >
          <div className={classes.drawerDialog} style={{ height }}>
            {children}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}

export default Drawer

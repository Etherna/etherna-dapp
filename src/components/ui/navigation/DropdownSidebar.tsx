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
import React, { useCallback, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Listbox } from "@headlessui/react"
import classNames from "classnames"

import classes from "@/styles/components/navigation/DropdownSidebar.module.scss"
import { SelectorIcon } from "@heroicons/react/solid"

type DropdownSidebarProps = {
  children?: React.ReactNode
  defaultTitle?: string
  className?: string
}

const DropdownSidebar: React.FC<DropdownSidebarProps> = ({ className, defaultTitle, children }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = useCallback(
    (item: React.ReactElement): boolean =>
      typeof item.props.isActive === "function"
        ? item.props.isActive(pathname)
        : !!item.props.isActive,
    [pathname]
  )

  const activeItem = useMemo(() => {
    let item = React.Children.toArray(children).find(item => isActive(item as any)) as
      | React.ReactElement
      | undefined

    if (item) {
      item = React.cloneElement(item, {
        iconSvg: item.props.activeIconSvg
          ? React.cloneElement(item.props.activeIconSvg, {
              className: "h-[1.15em] mr-2",
            })
          : undefined,
      })
    }

    return item
  }, [children, isActive])

  const goTo = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  return (
    <Listbox
      as="aside"
      className={classNames("relative mb-10 lg:mb-0", className)}
      value={pathname}
      onChange={goTo}
    >
      {({ open }) => (
        <>
          <Listbox.Button
            className={classNames(
              "flex items-center w-full px-4 py-3 rounded lg:hidden",
              "border border-gray-600 dark:border-gray-400",
              "transition-colors duration-75 active:bg-gray-500/10"
            )}
          >
            {activeItem?.props.iconSvg}
            {activeItem?.props.title ?? defaultTitle}
            <SelectorIcon className="h-[1.25em] ml-auto mr-0" />
          </Listbox.Button>

          <Listbox.Options
            className={classNames(
              "hidden flex-col absolute top-full inset-x-0 mt-2 p-4 space-y-2 z-10 rounded",
              "bg-gray-50 dark:bg-gray-800",
              "border border-gray-100 dark:border-gray-700 shadow-lg",
              "shadow-gray-800/20 focus:outline-none",
              "lg:static lg:flex lg:mt-0 lg:p-0 lg:border-none lg:bg-transparent lg:dark:bg-transparent lg:shadow-none",
              {
                flex: open,
              }
            )}
            static
          >
            {React.Children.map(children, (item: any, i) => (
              <Listbox.Option
                as="div"
                className=" min-w-[12rem] focus:outline-none"
                value={item.props.to}
                key={i}
              >
                {({ active }) => (
                  <span className={classNames({ "ring-blue-200": active })}>
                    {React.cloneElement(item, { to: undefined })}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  )
}

export default DropdownSidebar

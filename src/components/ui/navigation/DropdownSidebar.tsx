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

import React, { useCallback, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Listbox } from "@headlessui/react"
import classNames from "classnames"

import { ChevronUpDownIcon } from "@heroicons/react/24/solid"

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
              "flex w-full items-center rounded px-4 py-3 lg:hidden",
              "border border-gray-600 dark:border-gray-400",
              "transition-colors duration-75 active:bg-gray-500/10"
            )}
          >
            {activeItem?.props.iconSvg}
            {activeItem?.props.title ?? defaultTitle}
            <ChevronUpDownIcon className="ml-auto mr-0 h-[1.25em]" />
          </Listbox.Button>

          <Listbox.Options
            className={classNames(
              "absolute inset-x-0 top-full z-10 mt-2 flex-col space-y-2 rounded p-4",
              "bg-gray-50 dark:bg-gray-800",
              "border border-gray-100 shadow-lg dark:border-gray-700",
              "shadow-gray-800/20 focus:outline-none",
              "lg:static lg:mt-0 lg:flex lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent",
              {
                hidden: !open,
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

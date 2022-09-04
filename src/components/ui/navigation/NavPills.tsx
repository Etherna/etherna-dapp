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

import classNames from "classnames"

export type NavPillsProps = {
  children?: React.ReactNode
  className?: string
  vertical?: boolean
}

export type NavPillsItemProps = {
  children?: React.ReactNode
  active?: boolean
  vertical?: boolean
  onClick?: () => void
}

const NavPillsItem: React.FC<NavPillsItemProps> = ({ children, active, vertical, onClick }) => {
  return (
    <div
      className={classNames(
        "text-center font-semibold px-4 py-1.5 rounded-full cursor-pointer transition duration-200",
        "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800",
        "mr-2 last:mr-0",
        {
          "bg-primary-500/70 dark:bg-primary-500/50 text-gray-50 dark:text-gray-50": active,
          "mr-0 mb-2 last:mb-0 w-full": vertical,
        }
      )}
      onClick={onClick}
      data-component="nav-pills-item"
    >
      {children}
    </div>
  )
}

const NavPills: React.FC<NavPillsProps> & { Item: typeof NavPillsItem } = ({
  children,
  className,
  vertical,
}) => {
  return (
    <nav
      className={classNames(
        "flex",
        {
          "flex-col": vertical,
        },
        className
      )}
      data-component="nav-pills"
    >
      {React.Children.map(children, el => React.cloneElement(el as any, { vertical }))}
    </nav>
  )
}
NavPills.Item = NavPillsItem

export default NavPills

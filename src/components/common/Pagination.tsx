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
import { Listbox } from "@headlessui/react"
import classNames from "classnames"

import classes from "@styles/components/common/Pagination.module.scss"
import { ReactComponent as SelectorIcon } from "@assets/icons/selector.svg"
import { ReactComponent as ChevronLeft } from "@assets/icons/chevron-left.svg"
import { ReactComponent as ChevronDoubleLeft } from "@assets/icons/chevron-double-left.svg"

import Button from "./Button"

type PaginationProps = {
  className?: string
  defaultPage?: number
  defaultItemsPerPage?: number
  totalItems?: number
  onChange?(page: number, perPage: number): void
}

type PaginationSettingProps = {
  value: string
  options: string[]
  label: string
  onChange(val: string): void
}

const Pagination: React.FC<PaginationProps> = ({
  className,
  defaultPage = 1,
  defaultItemsPerPage = 20,
  totalItems = 0,
  onChange,
}) => {
  const [currentPage, setCurrentPage] = useState(`${defaultPage}`)
  const [itemsPerPage, setItemsPerPage] = useState(`${defaultItemsPerPage}`)

  const changeCurrentPage = (page: string) => {
    setCurrentPage(page)
    onChange?.(+page, +itemsPerPage)
  }

  const changeItemsPerPage = (count: string) => {
    setCurrentPage(`1`)
    setItemsPerPage(count)
    onChange?.(1, +count)
  }

  const pagesCount = Math.ceil(totalItems / +itemsPerPage)

  return (
    <div className={classNames(classes.pagination, className)}>
      <div className={classes.paginationSetup}>
        <PaginationSetting
          value={currentPage}
          options={Array(pagesCount).fill(0).map((_, i) => `${i + 1}`)}
          label="Page"
          onChange={changeCurrentPage}
        />
        <PaginationSetting
          value={itemsPerPage}
          options={["10", "20", "50", "100", "250"]}
          label="Per page"
          onChange={changeItemsPerPage}
        />
      </div>

      <div className={classes.paginationNavigation}>
        <Button
          modifier="transparent"
          disabled={currentPage === "1"}
          onClick={() => changeCurrentPage("1")}
          iconOnly
        >
          <ChevronDoubleLeft />
        </Button>
        <Button
          modifier="transparent"
          disabled={currentPage === "1"}
          onClick={() => changeCurrentPage(`${+currentPage - 1}`)}
          iconOnly
        >
          <ChevronLeft />
        </Button>
        <Button
          modifier="transparent"
          disabled={currentPage === `${pagesCount}`}
          onClick={() => changeCurrentPage(`${+currentPage + 1}`)}
          iconOnly
        >
          <ChevronLeft className="rotate-180" />
        </Button>
        <Button
          modifier="transparent"
          disabled={currentPage === `${pagesCount}`}
          onClick={() => changeCurrentPage(`${pagesCount}`)}
          iconOnly
        >
          <ChevronDoubleLeft className="rotate-180" />
        </Button>
      </div>

      <span className={classes.paginationInfo}>
        <span>{(+currentPage - 1) * +itemsPerPage + 1}</span>
        <span> - </span>
        <span>{Math.min(totalItems, (+currentPage - 1) * +itemsPerPage + +itemsPerPage)}</span>
        <span> of </span>
        <span>{totalItems}</span>
      </span>
    </div>
  )
}

const PaginationSetting: React.FC<PaginationSettingProps> = ({ value, options, label, onChange }) => (
  <div className={classes.paginationSetting}>
    <span>{label}:</span>
    <Listbox as="div" className="relative" value={value} onChange={onChange}>
      <Listbox.Button className={classes.paginationSettingToggle}>
        {value}
        <SelectorIcon />
      </Listbox.Button>
      <Listbox.Options className={classes.paginationSettingMenu}>
        {options.map(val => (
          <Listbox.Option value={val} key={val}>
            {({ active, selected }) => (
              <span className={classNames(classes.paginationSettingMenuItem, {
                [classes.selected]: selected,
                [classes.active]: active,
              })}>
                {val}
              </span>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  </div>
)

export default Pagination

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

import React, { useCallback, useState } from "react"
import { Listbox } from "@headlessui/react"

import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/actions"
import { cn } from "@/utils/classnames"
import { clamp } from "@/utils/math"

export type PaginationProps = {
  className?: string
  defaultPage?: number
  defaultItemsPerPage?: number
  totalItems?: number
  onChange?(page: number, perPage: number): void
}

export type PaginationSettingProps = {
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

  const changeCurrentPage = useCallback(
    (page: string) => {
      setCurrentPage(page)
      onChange?.(+page, +itemsPerPage)
    },
    [itemsPerPage, onChange]
  )

  const changeItemsPerPage = useCallback(
    (count: string) => {
      setCurrentPage(`1`)
      setItemsPerPage(count)
      onChange?.(1, +count)
    },
    [onChange]
  )

  const pagesCount = clamp(Math.ceil(totalItems / +itemsPerPage), 1, Number.MAX_SAFE_INTEGER)

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0",
        className
      )}
      data-component="pagination"
    >
      <div className="flex items-center space-x-5">
        <PaginationSetting
          value={currentPage}
          options={Array(pagesCount)
            .fill(0)
            .map((_, i) => `${i + 1}`)}
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

      <div className="flex items-center space-x-2 sm:ml-5">
        <Button
          color="transparent"
          disabled={currentPage === "1"}
          onClick={() => changeCurrentPage("1")}
        >
          <ChevronDoubleLeftIcon width={14} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          color="transparent"
          disabled={currentPage === "1"}
          onClick={() => changeCurrentPage(`${+currentPage - 1}`)}
        >
          <ChevronLeftIcon width={14} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          color="transparent"
          disabled={currentPage === `${pagesCount}`}
          onClick={() => changeCurrentPage(`${+currentPage + 1}`)}
        >
          <ChevronLeftIcon width={14} strokeWidth={2} aria-hidden className="rotate-180" />
        </Button>
        <Button
          color="transparent"
          disabled={currentPage === `${pagesCount}`}
          onClick={() => changeCurrentPage(`${pagesCount}`)}
        >
          <ChevronDoubleLeftIcon width={14} strokeWidth={2} aria-hidden className="rotate-180" />
        </Button>
      </div>

      {totalItems > 0 && (
        <span className="text-sm text-gray-400 dark:text-gray-500 sm:ml-auto">
          <span>{(+currentPage - 1) * +itemsPerPage + 1}</span>
          <span> - </span>
          <span>{Math.min(totalItems, (+currentPage - 1) * +itemsPerPage + +itemsPerPage)}</span>
          <span> of </span>
          <span>{totalItems}</span>
        </span>
      )}
    </div>
  )
}

const PaginationSetting: React.FC<PaginationSettingProps> = ({
  value,
  options,
  label,
  onChange,
}) => (
  <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500">
    <span>{label}:</span>
    <Listbox as="div" className="relative" value={value} onChange={onChange}>
      <Listbox.Button className="flex items-center px-1 py-px font-semibold text-gray-700 dark:text-gray-300">
        {value}
        <ChevronUpDownIcon className="ml-2 h-[1.2em]" aria-hidden />
      </Listbox.Button>
      <Listbox.Options
        className={cn(
          "absolute left-1/2 top-0 max-h-[60vh] min-w-[4rem] -translate-x-1/2 -translate-y-full overflow-y-auto",
          "-mt-2 flex flex-col items-center space-y-1 rounded px-3 py-2",
          "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          "shadow-md shadow-gray-100/20 dark:shadow-gray-800/20"
        )}
      >
        {options.map(val => (
          <Listbox.Option className="w-full cursor-pointer" value={val} key={val}>
            {({ active, selected }) => (
              <span
                className={cn("block w-full rounded px-2 py-1 text-center font-semibold", {
                  "text-primary-600 dark:text-primary-400": selected,
                  "bg-gray-400/20 dark:bg-gray-500/20": active,
                })}
              >
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

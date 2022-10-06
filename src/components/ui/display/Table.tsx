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

import React, { useCallback, useEffect, useState } from "react"
import classNames from "classnames"

import { Checkbox } from "@/components/ui/inputs"
import { Pagination } from "@/components/ui/navigation"

export type TableProps<T = any> = {
  className?: string
  title?: string
  page?: number
  total?: number
  itemsPerPage?: number
  isLoading?: boolean
  items?: T[]
  columns?: Array<{
    title: string
    width?: string
    hideOnMobile?: boolean
    render(item: T): React.ReactNode
  } | null>
  showSelection?: boolean
  selectionActions?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  onPageChange?(page: number, perPage?: number): void
  onSelectionChange?(selectedItems: T[]): void
}

const Table = <T, A>({
  className,
  title,
  items,
  columns,
  page,
  total,
  itemsPerPage = 20,
  isLoading,
  showSelection,
  selectionActions,
  loadingSkeleton,
  onPageChange,
  onSelectionChange,
}: TableProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<T[]>([])

  useEffect(() => {
    if (selectedItems.length > 0) {
      setSelectedItems([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useEffect(() => {
    onSelectionChange?.(selectedItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])

  const toggleSelection = useCallback(
    (item?: T, selected?: boolean) => {
      if (!item) {
        if (selectedItems.length) setSelectedItems([])
        else setSelectedItems(items ?? [])
      } else {
        if (selected) {
          setSelectedItems(items => [...items, item])
        } else {
          const index = selectedItems.indexOf(item)
          if (index >= 0) {
            selectedItems.splice(index, 1)
            setSelectedItems([...selectedItems])
          }
        }
      }
    },
    [items, selectedItems]
  )

  return (
    <div className={classNames("w-full", className)} data-component="table">
      {(title || selectionActions) && (
        <div className="flex flex-wrap items-center py-1">
          {(title || selectionActions) && <h2 className="text-lg lg:text-xl">{title}</h2>}
          {selectionActions && (
            <div
              className={classNames("ml-auto items-center space-x-3", {
                "hidden lg:invisible lg:flex": selectedItems.length === 0,
                "visible flex": selectedItems.length > 0,
              })}
            >
              {selectionActions}
            </div>
          )}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table
          className={classNames("min-w-full transition-opacity duration-200 ease-out", {
            "pointer-events-none opacity-30": isLoading,
          })}
        >
          <thead className="pb-4">
            <tr>
              {showSelection && (
                <th
                  className={classNames(
                    "py-2 px-1 text-left font-medium leading-none text-gray-600 dark:text-gray-300",
                    "border-b border-gray-300 dark:border-gray-700"
                  )}
                  style={{ width: "32px" }}
                >
                  <Checkbox
                    checked={selectedItems.length == items?.length && selectedItems.length > 0}
                    onChange={() => toggleSelection()}
                  />
                </th>
              )}
              {columns?.map((col, i) => {
                if (!col) return null
                return (
                  <th
                    className={classNames(
                      "py-2 text-left font-medium leading-none text-gray-600 dark:text-gray-300",
                      "border-b border-gray-300 dark:border-gray-700",
                      {
                        "hidden lg:table-cell": col.hideOnMobile,
                      }
                    )}
                    style={{ width: col.width }}
                    key={i}
                  >
                    {col.title}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {items?.map((item, i) => (
              <tr className="group" key={i}>
                {showSelection && (
                  <td className="border-t border-gray-200 px-1 py-2 group-first:border-t-0 dark:border-gray-800">
                    <Checkbox
                      checked={selectedItems.indexOf(item) >= 0}
                      onChange={val => toggleSelection(item, val)}
                    />
                  </td>
                )}
                {columns?.map((col, i) => {
                  if (!col) return null
                  return (
                    <td
                      className={classNames(
                        "border-t border-gray-200 px-1 py-2 group-first:border-t-0 dark:border-gray-800",
                        {
                          "hidden lg:table-cell": col.hideOnMobile,
                        }
                      )}
                      key={i}
                    >
                      {col.render(item)}
                    </td>
                  )
                })}
              </tr>
            ))}

            {isLoading && !items?.length && loadingSkeleton}
          </tbody>
        </table>
      </div>

      <Pagination
        className="mt-4"
        defaultPage={page}
        defaultItemsPerPage={itemsPerPage}
        totalItems={total}
        onChange={(page, count) => onPageChange?.(page, count)}
      />
    </div>
  )
}

export default Table

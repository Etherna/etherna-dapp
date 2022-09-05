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

import TableVideoPlaceholder from "@/components/placeholders/TableVideoPlaceholder"
import { Pagination } from "@/components/ui/navigation"

type TableProps<T = any> = {
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
        <div className="flex items-center flex-wrap py-1">
          {(title || selectionActions) && <h2 className="text-lg lg:text-xl">{title}</h2>}
          {selectionActions && (
            <div
              className={classNames("hidden lg:flex lg:invisible items-center ml-auto space-x-3", {
                "flex visible": selectedItems.length > 0,
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
            "opacity-30 pointer-events-none": isLoading,
          })}
        >
          <thead className="pb-4">
            <tr>
              {showSelection && (
                <th className="py-2" style={{ width: "32px" }}>
                  <input
                    type="checkbox"
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
                      "py-2 font-medium text-left text-gray-600 dark:text-gray-300",
                      "border-b border-gray-300 dark:border-gray-700",
                      {
                        "hidden xl:table-cell": col.hideOnMobile,
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
                  <td className="py-2 border-t border-gray-200 dark:border-gray-800 group-first:border-t-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.indexOf(item) >= 0}
                      onChange={e => toggleSelection(item, e.target.checked)}
                    />
                  </td>
                )}
                {columns?.map((col, i) => {
                  if (!col) return null
                  return (
                    <td
                      className={classNames(
                        "py-2 border-t border-gray-200 dark:border-gray-800 group-first:border-t-0",
                        {
                          "hidden xl:table-cell": col.hideOnMobile,
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

            {isLoading && !items?.length && <TableVideoPlaceholder />}
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

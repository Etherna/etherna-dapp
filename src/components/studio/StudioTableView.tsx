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

import React, { useEffect, useState } from "react"
import classNames from "classnames"

import classes from "@/styles/components/studio/StudioTableView.module.scss"

import Pagination from "@/components/common/Pagination"

type StudioTableViewProps<T = any> = {
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

const StudioTableView = <T, A>(props: StudioTableViewProps<T>) => {
  const {
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
  } = props

  const [selectedItems, setSelectedItems] = useState<T[]>([])

  useEffect(() => {
    setSelectedItems([])
  }, [items])

  useEffect(() => {
    onSelectionChange?.(selectedItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])

  const toggleSelection = (item?: T, selected?: boolean) => {
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
  }

  return (
    <div className={classNames(classes.studioTableContainer, className)}>
      {(title || selectionActions) && (
        <div className={classes.studioTableToolbar}>
          {(title || selectionActions) && (
            <h2 className={classes.studioTableTitle}>{title}</h2>
          )}
          {selectionActions && (
            <div className={classNames(classes.studioTableToolbarActions, {
              [classes.show]: selectedItems.length > 0
            })}>
              {selectionActions}
            </div>
          )}
        </div>
      )}

      <div className={classes.studioTableWrapper}>
        <table className={classNames(classes.studioTable, {
          [classes.loading]: isLoading
        })}>
          <thead>
            <tr>
              {showSelection && (
                <th style={{ width: "32px" }}>
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
                    className={classNames({
                      [classes.hideMobile]: col.hideOnMobile
                    })}
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
              <tr key={i}>
                {showSelection && (
                  <td>
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
                      className={classNames({
                        [classes.hideMobile]: col.hideOnMobile
                      })}
                      key={i}
                    >
                      {col.render(item)}
                    </td>
                  )
                })}
              </tr>
            ))}
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

export default StudioTableView

import React, { useEffect, useState } from "react"

import classes from "@styles/components/studio/StudioTableView.module.scss"
import classNames from "classnames"

type StudioTableViewProps<T = any> = {
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
  }>
  showSelection?: boolean
  onPageChange?(page: number): void
  onSelectionChange?(selectedItems: T[]): void
}

const StudioTableView = <T, A>(props: StudioTableViewProps<T>) => {
  const {
    title,
    items,
    columns,
    page,
    total,
    itemsPerPage = 20,
    isLoading,
    showSelection,
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

  const toggleSelection = (item?: T) => {
    if (!item) {
      if (selectedItems.length) setSelectedItems([])
      else setSelectedItems(items ?? [])
    } else {
      const index = selectedItems.indexOf(item)
      if (index >= 0) {
        selectedItems.splice(index, 1)
        setSelectedItems([...selectedItems])
      } else {
        setSelectedItems(items => [...items, item])
      }
    }
  }

  return (
    <div className={classes.studioTableContainer}>
      <h2 className={classes.studioTableTitle}>{title}</h2>

      <table className={classNames(classes.studioTable, {
        [classes.loading]: isLoading
      })}>
        <thead>
          <tr>
            {showSelection && (
              <th style={{ width: "32px" }}>
                <input
                  type="checkbox"
                  checked={selectedItems.length == items?.length}
                  onClick={() => toggleSelection()}
                />
              </th>
            )}
            {columns?.map((col, i) => (
              <th
                className={classNames({
                  [classes.hideMobile]: col.hideOnMobile
                })}
                style={{ width: col.width }}
                key={i}
              >
                {col.title}
              </th>
            ))}
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
                    onClick={() => toggleSelection(item)}
                  />
                </td>
              )}
              {columns?.map((col, i) => (
                <td
                  className={classNames({
                    [classes.hideMobile]: col.hideOnMobile
                  })}
                  key={i}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudioTableView

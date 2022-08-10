import React from "react"

import Placeholder from "@/components/common/Placeholder"

type TableVideoPlaceholderProps = {
  count?: number
}

const TableVideoPlaceholder: React.FC<TableVideoPlaceholderProps> = ({ count = 2 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <tr key={i}>
          <td></td>
          <td>
            <div className="flex items-center">
              <Placeholder className="w-20 h-14 rounded-md" />
              <Placeholder className="w-28 h-5 rounded-md ml-3" />
            </div>
          </td>
          <td>
            <Placeholder className="w-10 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-14 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-28 h-5 rounded-md" />
          </td>
          <td>
            <Placeholder className="w-28 h-5 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  )
}

export default TableVideoPlaceholder

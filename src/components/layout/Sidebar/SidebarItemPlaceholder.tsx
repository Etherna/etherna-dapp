import React from "react"

import Placeholder from "@common/Placeholder"

const SidebarItemPlaceholder = () => {
  const rows = 5
  const arrayMap = [...Array(rows).keys()]

  return (
    <>
      {arrayMap.map(i => (
        <div className="flex items-center py-2 px-3" key={i}>
          <Placeholder width="2rem" height="2rem" round="full" />
          <Placeholder className="ml-2" width="60%" height="1rem" round="sm" />
        </div>
      ))}
    </>
  )
}

export default SidebarItemPlaceholder

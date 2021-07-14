import React from "react"

import TopbarItem, { TopbarItemProps } from "@components/navigation/TopbarItem/TopbarItem"

const TopbarPopupItemToggle: React.FC<TopbarItemProps> = props => {
  const itemProps = { ...props }

  return (
    <TopbarItem {...itemProps}>
      {props.children && (
        props.children
      )}
    </TopbarItem>
  )
}

export default TopbarPopupItemToggle

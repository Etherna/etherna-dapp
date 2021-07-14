import React from "react"

import "./topbar-popup-item.scss"

import TopbarPopupItemToggle from "./TopbarPopupItemToggle"
import Popup from "@common/Popup"
import { TopbarItemProps } from "@components/navigation/TopbarItem/TopbarItem"

type TopbarPopupItemProps = TopbarItemProps & {
  toggle?: React.ReactElement
}

const TopbarPopupItem: React.FC<TopbarPopupItemProps> = props => {
  return (
    <div className="topbar-popup-item">
      <Popup
        toggle={
          <TopbarPopupItemToggle {...props}>
            {props.toggle}
          </TopbarPopupItemToggle>
        }
        placement="bottom"
      >
        {props.children}
      </Popup>
    </div>
  )
}

export default TopbarPopupItem

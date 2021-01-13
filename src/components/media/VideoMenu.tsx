import React, { useRef } from "react"
import { Link } from "react-router-dom"

import { DropDown, DropDownMenuToggle, DropDownItem, DropDownMenu } from "@common/DropDown"
import Button from "@common/Button"
import MoreIcon from "@components/icons/common/MoreIcon"
import Routes from "@routes"

type VideoMenuProps = {
  hash: string
}

const VideoMenu = ({ hash }: VideoMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <DropDown>
      <DropDownMenuToggle menuRef={menuRef}>
        <Button aspect="transparent" rounded={true} size="small" className="w-2 h-2">
          <MoreIcon className="m-auto" />
        </Button>
      </DropDownMenuToggle>
      <DropDownMenu menuRef={menuRef}>
        <DropDownItem>
          <Link to={Routes.getVideoSettingsLink(hash)}>Video Settings</Link>
        </DropDownItem>
      </DropDownMenu>
    </DropDown>
  )
}

export default VideoMenu

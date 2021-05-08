import React, { useRef } from "react"

import { ReactComponent as MoreIcon } from "@svg/icons/more-icon.svg"

import { DropDown, DropDownMenuToggle, DropDownItem, DropDownMenu } from "@common/DropDown"
import Button from "@common/Button"
import StateLink from "@common/StateLink"
import Routes from "@routes"
import { Video } from "@classes/SwarmVideo/types"

type VideoMenuProps = {
  video: Video
}

const VideoMenu = ({ video }: VideoMenuProps) => {
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
          <StateLink to={Routes.getVideoSettingsLink(video.hash)} state={video}>Video Settings</StateLink>
        </DropDownItem>
      </DropDownMenu>
    </DropDown>
  )
}

export default VideoMenu

import React from "react"

import { ReactComponent as MoreIcon } from "@svg/icons/more-icon.svg"

import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "@common/Dropdown"
import StateLink from "@common/StateLink"
import { Video } from "@classes/SwarmVideo/types"
import Routes from "@routes"

type VideoMenuProps = {
  video: Video
}

const VideoMenu: React.FC<VideoMenuProps> = ({ video }) => {
  return (
    <Dropdown>
      <DropdownToggle className="btn btn-rounded btn-transparent btn-sm w-2 h-2">
        <MoreIcon className="m-auto" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>
          <StateLink to={Routes.getVideoSettingsLink(video.hash)} state={video}>Video Settings</StateLink>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default VideoMenu

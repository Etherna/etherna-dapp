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

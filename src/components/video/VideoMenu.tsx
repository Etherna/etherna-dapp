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

import React from "react"

import { ReactComponent as MoreIcon } from "@assets/icons/more-circle.svg"

import Button from "@common/Button"
import Dropdown from "@common/Dropdown"
import DropdownToggle from "@common/DropdownToggle"
import DropdownItem from "@common/DropdownItem"
import DropdownMenu from "@common/DropdownMenu"
import StateLink from "@common/StateLink"
import Routes from "@routes"
import type { Video } from "@definitions/swarm-video"

type VideoMenuProps = {
  video: Video
}

const VideoMenu: React.FC<VideoMenuProps> = ({ video }) => {
  return (
    <Dropdown>
      <DropdownToggle>
        <MoreIcon className="w-5 h-5" />
      </DropdownToggle>
      <DropdownMenu className="!w-44">
        <DropdownItem>
          <StateLink to={Routes.getStudioVideoEditLink(video.reference)} state={video}>Video Settings</StateLink>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default VideoMenu

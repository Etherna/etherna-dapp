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

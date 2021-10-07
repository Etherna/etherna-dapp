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

import { ReactComponent as HomeIcon } from "@assets/icons/navigation/home.svg"
import { ReactComponent as FramesIcon } from "@assets/icons/navigation/frames.svg"
import { ReactComponent as UserIcon } from "@assets/icons/navigation/user.svg"
import { ReactComponent as PlaylistIcon } from "@assets/icons/navigation/playlists.svg"
import { ReactComponent as BookmarkIcon } from "@assets/icons/navigation/bookmark.svg"

import Tabbar from "@components/navigation/Tabbar"
import TabbarItem from "@components/navigation/TabbarItem"
import TabbarMenuItem from "@components/navigation/TabbarMenuItem"
import IndexExtension from "@components/env/IndexExtension"
import GatewayExtension from "@components/env/GatewayExtension"
import routes from "@routes"

const TabbarNavigation: React.FC = () => {
  return (
    <Tabbar>
      <TabbarItem
        title="Home"
        to="/"
        isActive={pathname => pathname === "/"}
        iconSvg={<HomeIcon />}
      />
      <TabbarItem
        title="Frames"
        to={routes.getFramesLink()}
        isActive={pathname => /^\/frames\//.test(pathname)}
        iconSvg={<FramesIcon />}
      />
      <TabbarItem
        title="Following"
        to={routes.getFollowingLink()}
        isActive={pathname => /^\/following\//.test(pathname)}
        iconSvg={<UserIcon />}
      />
      <TabbarItem
        title="Playlists"
        to={routes.getPlaylistsLink()}
        isActive={pathname => /^\/playlists\//.test(pathname)}
        iconSvg={<PlaylistIcon />}
      />
      <TabbarMenuItem as="div" title="More">
        <TabbarItem
          title="Saved"
          to={routes.getSavedLink()}
          isActive={pathname => /^\/saved\//.test(pathname)}
          iconSvg={<BookmarkIcon />}
          isSubmenu
        />
        <TabbarItem isSubmenu>
          <IndexExtension />
        </TabbarItem>
        <TabbarItem isSubmenu>
          <GatewayExtension />
        </TabbarItem>
      </TabbarMenuItem>
    </Tabbar>
  )
}

export default TabbarNavigation

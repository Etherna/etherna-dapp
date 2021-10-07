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

import Sidebar from "@components/navigation/Sidebar"
import SidebarItem from "@components/navigation/SidebarItem"
import SidebarSpace from "@components/navigation/SidebarSpace"
import SidebarLinks from "@components/navigation/SidebarLinks"
import IndexExtension from "@components/env/IndexExtension"
import GatewayExtension from "@components/env/GatewayExtension"
import { LayoutReducerTypes } from "@context/layout-context"
import { useLayoutState } from "@context/layout-context/hooks"
import routes from "@routes"
import { urlOrigin, urlPath } from "@utils/urls"
import SidebarLinksItem from "@components/navigation/SidebarLinksItem"

const SidebarNavigation: React.FC = () => {
  const [state, dispatch] = useLayoutState()
  const { hideSidebar, floatingSidebar } = state

  const hodeSidebar = () => {
    dispatch({
      type: LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
      hideSidebar: true
    })
  }

  return (
    <Sidebar floating={floatingSidebar} show={!hideSidebar} onClose={hodeSidebar}>
      <SidebarItem isStatic compact>
        <IndexExtension compactMobile />
      </SidebarItem>
      <SidebarItem isStatic compact>
        <GatewayExtension compactMobile />
      </SidebarItem>

      <SidebarSpace customHeight="1rem" />

      <SidebarItem
        title="Home"
        to="/"
        isActive={pathname => pathname === "/"}
        iconSvg={<HomeIcon />}
      />
      <SidebarItem
        title="Frames"
        to={routes.getFramesLink()}
        isActive={pathname => /^\/frames\//.test(pathname)}
        iconSvg={<FramesIcon />}
      />
      <SidebarItem
        title="Following"
        to={routes.getFollowingLink()}
        isActive={pathname => /^\/following\//.test(pathname)}
        iconSvg={<UserIcon />}
      />
      <SidebarItem
        title="Playlists"
        to={routes.getPlaylistsLink()}
        isActive={pathname => /^\/playlists\//.test(pathname)}
        iconSvg={<PlaylistIcon />}
      />
      <SidebarItem
        title="Saved"
        to={routes.getSavedLink()}
        isActive={pathname => /^\/saved\//.test(pathname)}
        iconSvg={<BookmarkIcon />}
      />

      <SidebarSpace flexible />

      <SidebarLinks>
        <SidebarLinksItem
          title="Index Api"
          to={urlPath(import.meta.env.VITE_APP_INDEX_URL, "/swagger")}
        />
        <SidebarLinksItem
          title="Gateway"
          to={urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)}
        />
        <SidebarLinksItem
          title="Credit"
          to={urlOrigin(import.meta.env.VITE_APP_CREDIT_URL)}
        />
        <SidebarLinksItem
          title="Privacy Policy"
          to={routes.getPrivacyPolicyLink()}
        />
      </SidebarLinks>
    </Sidebar>
  )
}

export default SidebarNavigation

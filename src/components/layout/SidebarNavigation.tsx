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

import React, { useCallback } from "react"
import { urlOrigin, urlPath } from "@etherna/api-js/utils"

import { BookmarkIcon, HomeIcon, UserIcon } from "@heroicons/react/24/solid"
import { ReactComponent as FramesIcon } from "@/assets/icons/navigation/frames.svg"
import { ReactComponent as PlaylistIcon } from "@/assets/icons/navigation/playlists.svg"

import FeedbackLink from "./FeedbackLink"
import Logo from "@/components/common/Logo"
import GatewayExtension from "@/components/env/GatewayExtension"
// import IndexExtension from "@/components/env/IndexExtension"
import { Sidebar } from "@/components/ui/navigation"
import { LayoutReducerTypes } from "@/context/layout-context"
import { useLayoutState } from "@/context/layout-context/hooks"
import routes from "@/routes"

const SidebarNavigation: React.FC = () => {
  const [state, dispatch] = useLayoutState()
  const { hideSidebar, floatingSidebar } = state

  const hodeSidebar = useCallback(() => {
    dispatch({
      type: LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
      hideSidebar: true,
    })
  }, [dispatch])

  return (
    <Sidebar floating={floatingSidebar} show={!hideSidebar} onClose={hodeSidebar}>
      <Sidebar.Logo className="mt-1.5" logo={<Logo />} logoCompact={<Logo compact />} />

      <Sidebar.Space customHeight="1rem" />

      {/* <Sidebar.Item isStatic>
        <IndexExtension compactMobile />
      </Sidebar.Item> */}
      <Sidebar.Item isStatic>
        <GatewayExtension compactMobile />
      </Sidebar.Item>

      <Sidebar.Space customHeight="1rem" />

      <Sidebar.Item
        title="Home"
        to="/"
        isActive={pathname => pathname === "/"}
        iconSvg={<HomeIcon />}
      />
      <Sidebar.Item
        title="Frames"
        to={routes.frames}
        isActive={pathname => /^\/frames\/?/.test(pathname)}
        iconSvg={<FramesIcon />}
      />
      <Sidebar.Item
        title="Following"
        to={routes.following}
        isActive={pathname => /^\/following\/?/.test(pathname)}
        iconSvg={<UserIcon />}
      />
      <Sidebar.Item
        title="Playlists"
        to={routes.playlists}
        isActive={pathname => /^\/playlists\/?/.test(pathname)}
        iconSvg={<PlaylistIcon />}
      />
      <Sidebar.Item
        title="Saved"
        to={routes.saved}
        isActive={pathname => /^\/saved\/?/.test(pathname)}
        iconSvg={<BookmarkIcon />}
      />

      <Sidebar.Space flexible />

      <Sidebar.Links>
        <Sidebar.LinksItem title="About Etherna" to="https://info.etherna.io/" target="_blank" />
        <Sidebar.LinksItem title="Blog" to="https://info.etherna.io/blog/" target="_blank" />
        <FeedbackLink wrapper={Sidebar.LinksItem} />
        <Sidebar.LinksItem title="GitHub" to="https://github.com/etherna" target="_blank" />
        <Sidebar.LinksItem
          title="Index Api"
          to={urlPath(import.meta.env.VITE_APP_INDEX_URL, "/swagger")}
          target="_blank"
        />
        <Sidebar.LinksItem
          title="Gateway"
          to={urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)}
          target="_blank"
        />
        {import.meta.env.VITE_APP_MATOMO_URL && (
          <Sidebar.LinksItem
            title="Analytics"
            to={urlOrigin(import.meta.env.VITE_APP_MATOMO_URL)}
            target="_blank"
          />
        )}
        {/* <Sidebar.LinksItem
          title="Credit"
          to={urlOrigin(import.meta.env.VITE_APP_CREDIT_URL)}
          target="_blank"
        /> */}
        <Sidebar.LinksItem title="Privacy Policy" to={routes.privacyPolicy} />
      </Sidebar.Links>
    </Sidebar>
  )
}

export default SidebarNavigation

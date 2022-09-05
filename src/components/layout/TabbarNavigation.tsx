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

import { BookmarkIcon, HomeIcon, UserIcon, ExternalLinkIcon } from "@heroicons/react/solid"
import { ReactComponent as FramesIcon } from "@/assets/icons/navigation/frames.svg"
import { ReactComponent as PlaylistIcon } from "@/assets/icons/navigation/playlists.svg"

import FeedbackLink from "./FeedbackLink"
// import IndexExtension from "@/components/env/IndexExtension"
import GatewayExtension from "@/components/env/GatewayExtension"
import Tabbar from "@/components/navigation/Tabbar"
import TabbarItem from "@/components/navigation/TabbarItem"
import TabbarMenuItem from "@/components/navigation/TabbarMenuItem"
import routes from "@/routes"
import { urlOrigin, urlPath } from "@/utils/urls"

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
        to={routes.frames}
        isActive={pathname => /^\/frames\//.test(pathname)}
        iconSvg={<FramesIcon />}
      />
      <TabbarItem
        title="Following"
        to={routes.following}
        isActive={pathname => /^\/following\//.test(pathname)}
        iconSvg={<UserIcon />}
      />
      <TabbarItem
        title="Playlists"
        to={routes.playlists}
        isActive={pathname => /^\/playlists\//.test(pathname)}
        iconSvg={<PlaylistIcon />}
      />
      <TabbarMenuItem as="div" title="More">
        <TabbarItem
          title="Saved"
          to={routes.saved}
          isActive={pathname => /^\/saved\//.test(pathname)}
          iconSvg={<BookmarkIcon />}
          isSubmenu
        />
        <TabbarItem title="Useful links" iconSvg={<ExternalLinkIcon />} isAccordion isSubmenu>
          <TabbarItem title="About Etherna" to="https://info.etherna.io/" target="_blank" />
          <TabbarItem title="Blog" to="https://info.etherna.io/blog/" target="_blank" />
          <TabbarItem title="GitHub" to="https://github.com/etherna" target="_blank" />
          <TabbarItem
            title="Index Api"
            to={urlPath(import.meta.env.VITE_APP_INDEX_URL, "/swagger")}
            target="_blank"
          />
          <TabbarItem
            title="Gateway"
            to={urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)}
            target="_blank"
          />
          <TabbarItem
            title="Credit"
            to={urlOrigin(import.meta.env.VITE_APP_CREDIT_URL)}
            target="_blank"
          />
          <TabbarItem title="Privacy Policy" to={routes.privacyPolicy} />
          <FeedbackLink wrapper={TabbarItem} />
        </TabbarItem>
        {/* <TabbarItem isSubmenu>
          <IndexExtension />
        </TabbarItem> */}
        <TabbarItem isSubmenu>
          <GatewayExtension />
        </TabbarItem>
      </TabbarMenuItem>
    </Tabbar>
  )
}

export default TabbarNavigation

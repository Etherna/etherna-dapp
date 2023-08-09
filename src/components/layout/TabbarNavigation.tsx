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
import { urlOrigin, urlPath } from "@etherna/sdk-js/utils"

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { BookmarkIcon, HomeIcon, UserIcon } from "@heroicons/react/24/solid"
import { ReactComponent as FramesIcon } from "@/assets/icons/navigation/frames.svg"
import { ReactComponent as PlaylistIcon } from "@/assets/icons/navigation/playlists.svg"

import FeedbackLink from "./FeedbackLink"
// import IndexExtension from "@/components/env/IndexExtension"
import GatewayExtension from "@/components/env/GatewayExtension"
import { Tabbar } from "@/components/ui/navigation"
import routes from "@/routes"

const TabbarNavigation: React.FC = () => {
  return (
    <Tabbar>
      <Tabbar.Item
        title="Home"
        to="/"
        isActive={pathname => pathname === "/"}
        iconSvg={<HomeIcon />}
      />
      <Tabbar.Item
        title="Frames"
        to={routes.frames}
        isActive={pathname => /^\/frames\//.test(pathname)}
        iconSvg={<FramesIcon />}
      />
      <Tabbar.Item
        title="Following"
        to={routes.following}
        isActive={pathname => /^\/following\//.test(pathname)}
        iconSvg={<UserIcon />}
      />
      <Tabbar.Item
        title="Playlists"
        to={routes.playlists}
        isActive={pathname => /^\/playlists\//.test(pathname)}
        iconSvg={<PlaylistIcon />}
      />
      <Tabbar.MenuItem as="div" title="More">
        <Tabbar.Item
          title="Saved"
          to={routes.saved}
          isActive={pathname => /^\/saved\//.test(pathname)}
          iconSvg={<BookmarkIcon />}
          isSubmenu
        />
        <Tabbar.Item
          title="Useful links"
          iconSvg={<ArrowTopRightOnSquareIcon strokeWidth={2} />}
          isAccordion
          isSubmenu
        >
          <Tabbar.Item title="About Etherna" to="https://info.etherna.io/" target="_blank" />
          <Tabbar.Item title="Blog" to="https://info.etherna.io/blog/" target="_blank" />
          <Tabbar.Item title="GitHub" to="https://github.com/etherna" target="_blank" />
          <Tabbar.Item
            title="Index Api"
            to={urlPath(import.meta.env.VITE_APP_INDEX_URL, "/swagger")}
            target="_blank"
          />
          <Tabbar.Item
            title="Gateway"
            to={urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)}
            target="_blank"
          />
          <Tabbar.Item
            title="Credit"
            to={urlOrigin(import.meta.env.VITE_APP_CREDIT_URL)}
            target="_blank"
          />
          <Tabbar.Item title="Privacy Policy" to={routes.privacyPolicy} />
          <FeedbackLink wrapper={Tabbar.Item} />
        </Tabbar.Item>
        {/* <Tabbar.Item isSubmenu>
          <IndexExtension />
        </Tabbar.Item> */}
        <Tabbar.Item isSubmenu>
          <GatewayExtension />
        </Tabbar.Item>
      </Tabbar.MenuItem>
    </Tabbar>
  )
}

export default TabbarNavigation

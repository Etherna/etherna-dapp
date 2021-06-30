import React from "react"

import { ReactComponent as HomeIcon } from "@svg/icons/navigation/home.svg"
import { ReactComponent as FramesIcon } from "@svg/icons/navigation/frames.svg"
import { ReactComponent as UserIcon } from "@svg/icons/navigation/user.svg"
import { ReactComponent as PlaylistIcon } from "@svg/icons/navigation/playlists.svg"
import { ReactComponent as BookmarkIcon } from "@svg/icons/navigation/bookmark.svg"

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
      <TabbarMenuItem title="More">
        <TabbarItem
          title="Saved"
          to={routes.getSavedLink()}
          isActive={pathname => /^\/saved\//.test(pathname)}
          iconSvg={<BookmarkIcon />}
        />
        <TabbarItem>
          <IndexExtension />
        </TabbarItem>
        <TabbarItem>
          <GatewayExtension />
        </TabbarItem>
      </TabbarMenuItem>
    </Tabbar>
  )
}

export default TabbarNavigation

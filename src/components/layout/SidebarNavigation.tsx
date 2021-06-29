import React from "react"

import { ReactComponent as HomeIcon } from "@svg/icons/navigation/home.svg"
import { ReactComponent as FramesIcon } from "@svg/icons/navigation/frames.svg"
import { ReactComponent as UserIcon } from "@svg/icons/navigation/user.svg"
import { ReactComponent as PlaylistIcon } from "@svg/icons/navigation/playlists.svg"
import { ReactComponent as BookmarkIcon } from "@svg/icons/navigation/bookmark.svg"

import { ReducerTypes, useStateValue } from "./DefaultLayout/LayoutContext"
import Sidebar from "@components/navigation/Sidebar"
import SidebarItem from "@components/navigation/SidebarItem"
import SidebarSpace from "@components/navigation/SidebarSpace"
import SidebarLinks from "@components/navigation/SidebarLinks"
import IndexExtension from "@components/env/IndexExtension"
import GatewayExtension from "@components/env/GatewayExtension"
import routes from "@routes"
import { urlOrigin, urlPath } from "@utils/urls"

const SidebarNavigation: React.FC = () => {
  const [state, dispatch] = useStateValue()
  const { hideSidebar, floatingSidebar } = state

  const hodeSidebar = () => {
    dispatch({
      type: ReducerTypes.SET_HIDE_SIDEBAR,
      hideSidebar: true
    })
  }

  return (
    <Sidebar floating={floatingSidebar} show={!hideSidebar} onClose={hodeSidebar}>
      <SidebarItem isStatic compact>
        <IndexExtension />
      </SidebarItem>
      <SidebarItem isStatic compact>
        <GatewayExtension />
      </SidebarItem>

      <SidebarSpace />

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
        <SidebarItem
          title="Index Api"
          to={urlPath(import.meta.env.VITE_APP_INDEX_URL, '/swagger')}
        />
        <SidebarItem
          title="Gateway"
          to={urlOrigin(import.meta.env.VITE_APP_GATEWAY_URL)}
        />
        <SidebarItem
          title="Credit"
          to={urlOrigin(import.meta.env.VITE_APP_CREDIT_URL)}
        />
        <SidebarItem
          title="Privacy Policy"
          to={routes.getPrivacyPolicyLink()}
        />
      </SidebarLinks>
    </Sidebar>
  )
}

export default SidebarNavigation

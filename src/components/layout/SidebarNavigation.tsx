import React from "react"

import { ReactComponent as HomeIcon } from "@svg/icons/navigation/home.svg"
import { ReactComponent as FramesIcon } from "@svg/icons/navigation/frames.svg"
import { ReactComponent as UserIcon } from "@svg/icons/navigation/user.svg"
import { ReactComponent as PlaylistIcon } from "@svg/icons/navigation/playlists.svg"
import { ReactComponent as BookmarkIcon } from "@svg/icons/navigation/bookmark.svg"

import Sidebar from "@components/navigation/Sidebar"
import SidebarItem from "@components/navigation/SidebarItem"
import SidebarSpace from "@components/navigation/SidebarSpace"
import SidebarLinks from "@components/navigation/SidebarLinks"
import routes from "@routes"
import { ReducerTypes, useStateValue } from "./DefaultLayout/LayoutContext"

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
          to={`${import.meta.env.VITE_APP_INDEX_HOST}/swagger`}
        />
        <SidebarItem
          title="Gateway"
          to={import.meta.env.VITE_APP_GATEWAY_HOST}
        />
        <SidebarItem
          title="Credit"
          to={import.meta.env.VITE_APP_CREDIT_HOST}
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

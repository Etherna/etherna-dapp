import React from "react"

import { ReactComponent as Logo } from "@svg/logo.svg"
import { ReactComponent as LogoCompact } from "@svg/logo-compact.svg"
import { ReactComponent as PlusIcon } from "@svg/icons/plus.svg"
import { ReactComponent as SearchIcon } from "@svg/icons/navigation/search.svg"
import { ReactComponent as MenuIcon } from "@svg/icons/navigation/menu.svg"
import { ReactComponent as UploadIcon } from "@svg/icons/upload-icon.svg"

import Topbar from "@components/navigation/Topbar"
import TopbarLogo from "@components/navigation/TopbarLogo"
import TopbarItem from "@components/navigation/TopbarItem"
import TopbarSpace from "@components/navigation/TopbarSpace"
import UserCredit from "@components/user/UserCredit"
import UserMenu from "@components/user/UserMenu"
import { LayoutReducerTypes } from "@context/layout-context"
import { useLayoutState } from "@context/layout-context/hooks"
import useSelector from "@state/useSelector"
import TopbarPopupItem from "@components/navigation/TopbarPopupItem"
import routes from "@routes"

const TopbarNavigation: React.FC = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)

  const [state, dispatch] = useLayoutState()
  const { floatingSidebar, hideSidebar } = state

  const toggleSidebar = () => {
    dispatch({
      type: LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
      hideSidebar: !hideSidebar
    })
  }

  return (
    <Topbar>
      {floatingSidebar && (
        <TopbarItem
          iconSvg={<MenuIcon />}
          onClick={toggleSidebar}
        />
      )}

      <TopbarLogo
        logo={<Logo />}
        logoCompact={<LogoCompact />}
      />

      <TopbarPopupItem
        toggle={<PlusIcon />}
      >
        <TopbarItem to={routes.getVideoUploadLink()} iconSvg={<UploadIcon />}>
          Upload a video
        </TopbarItem>
      </TopbarPopupItem>
      <TopbarItem
        iconSvg={<SearchIcon />}
      />

      <TopbarSpace flexible />

      {isSignedIn === true && !isLoadingProfile && (
        <TopbarItem ignoreHoverState>
          <UserCredit />
        </TopbarItem>
      )}

      <TopbarItem ignoreHoverState>
        <UserMenu />
      </TopbarItem>
    </Topbar>
  )
}

export default TopbarNavigation

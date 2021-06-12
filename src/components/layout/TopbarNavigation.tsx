import React from "react"

import { ReactComponent as Logo } from "@svg/logo.svg"
import { ReactComponent as LogoCompact } from "@svg/logo-compact.svg"
import { ReactComponent as SearchIcon } from "@svg/icons/navigation/search.svg"
import { ReactComponent as MenuIcon } from "@svg/icons/navigation/menu.svg"

import Topbar from "@components/navigation/Topbar"
import TopbarLogo from "@components/navigation/TopbarLogo"
import TopbarItem from "@components/navigation/TopbarItem"
import TopbarSpace from "@components/navigation/TopbarSpace"
import UserCredit from "@components/user/UserCredit"
import UserMenu from "@components/user/UserMenu"
import useSelector from "@state/useSelector"
import { ReducerTypes, useStateValue } from "./DefaultLayout/LayoutContext"

const TopbarNavigation: React.FC = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)

  const [state, dispatch] = useStateValue()
  const { floatingSidebar, hideSidebar } = state

  const toggleSidebar = () => {
    dispatch({
      type: ReducerTypes.SET_HIDE_SIDEBAR,
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

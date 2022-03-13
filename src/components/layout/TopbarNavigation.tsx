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

import { ReactComponent as Logo } from "@assets/logo.svg"
import { ReactComponent as LogoCompact } from "@assets/logo-compact.svg"
import { ReactComponent as PlusIcon } from "@assets/icons/plus.svg"
import { ReactComponent as MenuIcon } from "@assets/icons/navigation/menu.svg"
import { ReactComponent as UploadIcon } from "@assets/icons/upload.svg"

import SearchItem from "./SearchItem"
import Topbar from "@components/navigation/Topbar"
import TopbarLogo from "@components/navigation/TopbarLogo"
import TopbarItem from "@components/navigation/TopbarItem"
import TopbarSpace from "@components/navigation/TopbarSpace"
import TopbarPopupItem from "@components/navigation/TopbarPopupItem"
import AlphaWarning from "@components/navigation/AlphaWarning"
import UserCredit from "@components/user/UserCredit"
import UserMenu from "@components/user/UserMenu"
import { LayoutReducerTypes } from "@context/layout-context"
import { useLayoutState } from "@context/layout-context/hooks"
import useSelector from "@state/useSelector"
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
          hideMobile
        />
      )}

      <TopbarLogo
        logo={<Logo />}
        logoCompact={<LogoCompact />}
      />

      <TopbarPopupItem toggle={<PlusIcon />} hideMobile>
        <TopbarItem to={routes.studioVideoNew} iconSvg={<UploadIcon />}>
          Upload a video
        </TopbarItem>
      </TopbarPopupItem>
      <SearchItem />

      <TopbarSpace flexible />

      <AlphaWarning />

      <TopbarSpace flexible />

      {isSignedIn === true && !isLoadingProfile && (
        <TopbarItem ignoreHoverState>
          <UserCredit />
        </TopbarItem>
      )}

      <TopbarItem className="!-mr-2" ignoreHoverState>
        <UserMenu />
      </TopbarItem>
    </Topbar>
  )
}

export default TopbarNavigation

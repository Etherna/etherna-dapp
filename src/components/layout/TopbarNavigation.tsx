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

import { ArrowUpTrayIcon, Bars2Icon, PlusIcon } from "@heroicons/react/24/outline"

import SearchItem from "./SearchItem"
import Logo from "@/components/common/Logo"
import AlphaWarning from "@/components/modals/AlphaWarning"
import { Topbar } from "@/components/ui/navigation"
import UserCredit from "@/components/user/UserCredit"
import UserMenu from "@/components/user/UserMenu"
import { LayoutReducerTypes } from "@/context/layout-context"
import { useLayoutState } from "@/context/layout-context/hooks"
import routes from "@/routes"
import useSelector from "@/state/useSelector"

const TopbarNavigation: React.FC = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const { isLoadingProfile } = useSelector(state => state.ui)

  const [state, dispatch] = useLayoutState()
  const { floatingSidebar, hideSidebar } = state

  const toggleSidebar = useCallback(() => {
    dispatch({
      type: LayoutReducerTypes.SET_SIDEBAR_HIDDEN,
      hideSidebar: !hideSidebar,
    })
  }, [dispatch, hideSidebar])

  return (
    <Topbar>
      <Topbar.Group>
        {floatingSidebar && (
          <Topbar.Item onClick={toggleSidebar} hideMobile>
            <Bars2Icon width={22} strokeWidth={2} />
          </Topbar.Item>
        )}
        <Topbar.Logo logo={<Logo />} logoCompact={<Logo compact />} floating={floatingSidebar} />
      </Topbar.Group>

      <Topbar.Group leftCorrection>
        <Topbar.PopupItem toggle={<PlusIcon strokeWidth={2.5} width={20} aria-hidden />} hideMobile>
          <Topbar.Item
            to={routes.studioVideoNew}
            prefix={<ArrowUpTrayIcon width={20} aria-hidden />}
          >
            Upload a video
          </Topbar.Item>
        </Topbar.PopupItem>

        <SearchItem />
      </Topbar.Group>

      <Topbar.Space flexible />

      <AlphaWarning />

      <Topbar.Space flexible />

      <Topbar.Group>
        {isSignedIn === true && !isLoadingProfile && (
          <Topbar.Item ignoreHoverState noPadding>
            <UserCredit />
          </Topbar.Item>
        )}

        <Topbar.Item ignoreHoverState noPadding>
          <UserMenu />
        </Topbar.Item>
      </Topbar.Group>
    </Topbar>
  )
}

export default TopbarNavigation

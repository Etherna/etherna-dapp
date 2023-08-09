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

import React, { useCallback, useEffect, useMemo, useState } from "react"

import ProfileAbout from "./ProfileAbout"
import ProfileVideos from "./ProfileVideos"
import SwarmPlaylist from "@/classes/SwarmPlaylist"
import SEO from "@/components/layout/SEO"
import ProfileInfo from "@/components/profile/ProfileInfo"
import { Button } from "@/components/ui/actions"
import { NavPills } from "@/components/ui/navigation"
import usePlaylistVideos from "@/hooks/usePlaylistVideos"
import routes from "@/routes"
import useEnvironmentStore from "@/stores/env"
import useUserStore from "@/stores/user"

import type { Profile } from "@etherna/sdk-js"
import type { EthAddress } from "@etherna/sdk-js/clients"

type ProfileViewProps = {
  profileAddress: EthAddress
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileAddress }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState("videos")
  const address = useUserStore(state => state.address)
  const isMobile = useEnvironmentStore(state => state.isMobile)
  const {
    playlist,
    videos,
    error,
    hasMore,
    isFetching,
    isLoadingPlaylist,
    smartFetchCount,
    loadMore,
    loadPlaylist,
  } = usePlaylistVideos(SwarmPlaylist.Reader.channelPlaylistId, {
    owner: profile,
  })

  const isLoading = useMemo(() => {
    return isFetching || !profile || isLoadingPlaylist
  }, [isFetching, profile, isLoadingPlaylist])

  useEffect(() => {
    setProfile(null)
  }, [profileAddress])

  useEffect(() => {
    if (profile) {
      loadPlaylist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    if (profile && playlist) {
      loadMore()
    }
  }, [playlist, profile, smartFetchCount, loadMore])

  const handleFetchedProfile = useCallback((profile: Profile | null) => {
    setProfile(profile)
  }, [])

  return (
    <>
      <SEO title={profile?.name ?? profileAddress} />
      <ProfileInfo
        profileAddress={profileAddress}
        nav={
          <NavPills vertical={!isMobile}>
            <NavPills.Item active={activeTab === "videos"} onClick={() => setActiveTab("videos")}>
              Videos
            </NavPills.Item>
            <NavPills.Item active={activeTab === "about"} onClick={() => setActiveTab("about")}>
              About
            </NavPills.Item>
          </NavPills>
        }
        actions={
          <div className="flex flex-grow items-center justify-between">
            {address === profileAddress && (
              <Button as="a" to={routes.studioChannel}>
                Customize
              </Button>
            )}
          </div>
        }
        onFetchedProfile={handleFetchedProfile}
      >
        {activeTab === "videos" && (
          <ProfileVideos
            videos={videos}
            error={error}
            hasMoreVideos={hasMore}
            isFetching={isLoading}
            onLoadMore={loadMore}
            fetchingPreviewCount={smartFetchCount || 9}
          />
        )}
        {activeTab === "about" && (
          <ProfileAbout
            address={profileAddress}
            description={profile?.description}
            name={profile?.name}
          />
        )}
      </ProfileInfo>
    </>
  )
}

export default ProfileView

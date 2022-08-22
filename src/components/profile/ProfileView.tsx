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
import Button from "@/components/common/Button"
import NavPills from "@/components/common/NavPills"
import NavPillsItem from "@/components/common/NavPillsItem"
import SEO from "@/components/layout/SEO"
import ProfileInfo from "@/components/profile/ProfileInfo"
import routes from "@/routes"
import usePlaylistVideos from "@/hooks/usePlaylistVideos"
import useUserPlaylists from "@/hooks/useUserPlaylists"
import useSelector from "@/state/useSelector"
import type { Profile } from "@/definitions/swarm-profile"

type ProfileViewProps = {
  profileAddress: string
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileAddress }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState("videos")
  const { address } = useSelector(state => state.user)
  const { isMobile } = useSelector(state => state.env)
  const { channelPlaylist, loadPlaylists } = useUserPlaylists(profileAddress, { resolveChannel: true })
  const { videos, hasMore, isFetching, loadMore } = usePlaylistVideos(channelPlaylist, {
    owner: profile,
    limit: 20,
  })

  const isLoading = useMemo(() => {
    return isFetching || !profile || !channelPlaylist
  }, [channelPlaylist, profile, isFetching])

  useEffect(() => {
    loadPlaylists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    if (profile && channelPlaylist) {
      loadMore()
    }
  }, [channelPlaylist, profile, loadMore])

  const handleFetchedProfile = useCallback((profile: Profile | null) => {
    setProfile(profile)
  }, [])

  return (
    <>
      <SEO title={profile?.name ?? profileAddress} />
      <ProfileInfo
        profileAddress={profileAddress}
        nav={
          <NavPills vertical={!isMobile} className="mt-10">
            <NavPillsItem active={activeTab === "videos"} onClick={() => setActiveTab("videos")}>
              Videos
            </NavPillsItem>
            <NavPillsItem active={activeTab === "about"} onClick={() => setActiveTab("about")}>
              About
            </NavPillsItem>
          </NavPills>
        }
        actions={
          <div className="flex ml-auto">
            {address === profileAddress && (
              <Button
                as="a"
                href={routes.studioChannel}
                className="ml-2"
              >
                Customize
              </Button>
            )}
          </div>
        }
        onFetchedProfile={handleFetchedProfile}
      >
        {activeTab === "videos" && (
          <ProfileVideos
            hasMoreVideos={hasMore}
            isFetching={isLoading}
            onLoadMore={loadMore}
            videos={videos}
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

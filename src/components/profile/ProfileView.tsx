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

import React, { useEffect, useRef, useState } from "react"
import { z } from "zod"

import ProfileAbout from "./ProfileAbout"
import ProfileVideos from "./ProfileVideos"
import SEO from "@/components/layout/SEO"
import ProfileInfo from "@/components/profile/ProfileInfo"
import { Button } from "@/components/ui/actions"
import { NavPills } from "@/components/ui/navigation"
import useSmartFetchCount from "@/hooks/useSmartFetchCount"
import { useChannelVideosQuery } from "@/queries/channel-videos-query"
import routes from "@/routes"
import useEnvironmentStore from "@/stores/env"
import useExtensionsStore from "@/stores/extensions"
import useUserStore from "@/stores/user"

import type { Profile } from "@etherna/sdk-js"
import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ProfileViewProps = {
  profileAddress: EthAddress | EnsAddress
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileAddress }) => {
  const indexesList = useExtensionsStore(state => state.indexesList)
  const address = useUserStore(state => state.address)
  const needsFunds = useUserStore(state => state.needsFunds)
  const isMobile = useEnvironmentStore(state => state.isMobile)
  const gridRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState(needsFunds ? indexesList[0].url : "channel")
  const fetchCount = useSmartFetchCount(gridRef)
  const videosQuery = useChannelVideosQuery({
    address: profileAddress,
    profile,
    source: activeTab,
    firstFetchCount: fetchCount ?? 48,
    sequentialFetchCount: 12,
  })
  const isIndexTab = z.string().url().safeParse(activeTab).success

  useEffect(() => {
    setProfile(null)
  }, [profileAddress])

  useEffect(() => {
    if (needsFunds && activeTab === "channel") {
      setActiveTab(indexesList[0].url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsFunds])

  return (
    <>
      <SEO title={profile?.preview.name ?? profileAddress} />
      <ProfileInfo
        profileAddress={profileAddress}
        nav={
          <NavPills vertical={!isMobile}>
            <NavPills.Item active={activeTab === "channel"} onClick={() => setActiveTab("channel")}>
              Channel
            </NavPills.Item>
            {indexesList.map(index => (
              <NavPills.Item
                key={index.url}
                active={activeTab === index.url}
                onClick={() => setActiveTab(index.url)}
              >
                {index.name}
              </NavPills.Item>
            ))}
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
        onFetchedProfile={setProfile}
      >
        {(activeTab === "channel" || isIndexTab) && (
          <ProfileVideos
            gridRef={gridRef}
            videos={videosQuery.data?.pages.flat()}
            error={videosQuery.error}
            hasMoreVideos={videosQuery.hasNextPage}
            isFetching={videosQuery.isFetching || videosQuery.isLoading}
            onLoadMore={videosQuery.fetchNextPage}
            fetchingPreviewCount={fetchCount || 12}
          />
        )}
        {activeTab === "about" && (
          <ProfileAbout
            address={profileAddress}
            description={profile?.details?.description}
            name={profile?.preview.name}
          />
        )}
      </ProfileInfo>
    </>
  )
}

export default ProfileView

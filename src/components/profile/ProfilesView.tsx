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
import React, { useState, useEffect, useCallback } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

import ProfilePreview from "./ProfilePreview"
import ProfilePreviewPlaceholder from "@/components/placeholders/ProfilePreviewPlaceholder"
import useClientsStore from "@/stores/clients"

import type { IndexUser } from "@etherna/api-js/clients"

const FETCH_COUNT = 10

const ProfilesView: React.FC = () => {
  const indexClient = useClientsStore(state => state.indexClient)
  const [profiles, setProfiles] = useState<IndexUser[]>()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfiles = useCallback(async () => {
    // increment page to avoid requests at the same page
    setPage(page + 1)

    try {
      const fetchedProfiles = await indexClient.users.fetchUsers(page, FETCH_COUNT)

      setProfiles((profiles || []).concat(fetchedProfiles))

      if (fetchedProfiles.length < FETCH_COUNT) {
        setHasMore(false)
      }
    } catch (error: any) {
      console.error(error)
      setProfiles(profiles || [])
      setHasMore(false)
    }
  }, [indexClient, page, profiles])

  return (
    <div className="mt-6">
      {profiles === undefined && <ProfilePreviewPlaceholder />}

      <InfiniteScroller
        dataLength={profiles?.length ?? 0}
        next={fetchProfiles}
        hasMore={hasMore}
        scrollThreshold={30}
        loader={<div />}
      >
        {profiles ? (
          profiles.map((profile, index) => (
            <ProfilePreview profileAddress={profile.address} key={`${profile.address}-${index}`} />
          ))
        ) : (
          <div />
        )}
      </InfiniteScroller>
    </div>
  )
}

export default ProfilesView

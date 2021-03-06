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

import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroller"

import "./profiles.scss"

import ProfilePreview from "../ProfilePreview"
import ProfilePreviewPlaceholder from "../ProfilePreviewPlaceholder"
import useSelector from "@state/useSelector"
import { IndexUser } from "@classes/EthernaIndexClient/types"

const FETCH_COUNT = 10

const ProfilesView = () => {
  const { indexClient } = useSelector(state => state.env)
  const [profiles, setProfiles] = useState<IndexUser[]>()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfiles = async () => {
    // increment page to avoid requests at the same page
    setPage(page + 1)

    try {
      const fetchedProfiles = await indexClient.users.fetchUsers(page, FETCH_COUNT)

      setProfiles((profiles || []).concat(fetchedProfiles))

      if (fetchedProfiles.length < FETCH_COUNT) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
      setProfiles(profiles || [])
      setHasMore(false)
    }
  }

  return (
    <div className="profiles">
      {profiles === undefined && <ProfilePreviewPlaceholder />}

      <InfiniteScroller
        loadMore={fetchProfiles}
        hasMore={hasMore}
        initialLoad={false}
        threshold={30}
      >
        {profiles ? (
          profiles.map((profile, index) => (
            <ProfilePreview
              profileAddress={profile.address}
              profileManifest={profile.identityManifest}
              key={`${profile.address}-${index}`}
            />
          ))
        ) : (
          <div></div>
        )}
      </InfiniteScroller>
    </div>
  )
}

export default ProfilesView

import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroll-component"

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
        dataLength={profiles?.length ?? 0}
        next={fetchProfiles}
        hasMore={hasMore}
        scrollThreshold={30}
        loader={<div />}
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

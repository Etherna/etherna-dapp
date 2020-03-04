import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroller"
import { Link } from "gatsby"

import "./profiles.scss"
import { getProfiles } from "@utils/3box"
import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import { getChannelsWithVideos } from "@utils/ethernaResources/channelResources"
import * as Routes from "@routes"

const FETCH_COUNT = 10

const ProfilesView = () => {
    const [profiles, setProfiles] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProfiles = async () => {
        try {
            const fetchedProfiles = await getChannelsWithVideos(
                page,
                FETCH_COUNT,
                5
            )
            const boxProfiles = await getProfiles(
                fetchedProfiles.map(p => p.address)
            )
            const mappedProfiles = fetchedProfiles.map(p => {
                const boxProfile =
                    boxProfiles.find(bp => bp.address === p.address) || {}
                const videos = (p.videos || []).map(v => ({
                    ...v,
                    profileData: boxProfile,
                }))
                return {
                    ...p,
                    videos,
                    profileData: boxProfile,
                }
            })

            setProfiles(profiles.concat(mappedProfiles))

            if (fetchedProfiles.length < FETCH_COUNT) {
                setHasMore(false)
            } else {
                setPage(page + 1)
            }
        } catch (error) {
            console.error(error)
            setHasMore(false)
        }
    }

    return (
        <div className="profiles">
            <InfiniteScroller
                loadMore={fetchProfiles}
                hasMore={hasMore}
                initialLoad={false}
                threshold={30}
            >
                {profiles.map(profile => {
                    return (
                        <div className="profile-preview" key={profile.address}>
                            <div className="profile-info">
                                <Link
                                    to={Routes.getProfileLink(profile.address)}
                                >
                                    <Avatar
                                        image={profile.profileData.avatar}
                                        address={profile.address}
                                    />
                                </Link>
                                <Link
                                    to={Routes.getProfileLink(profile.address)}
                                >
                                    <h3>{profile.profileData.name}</h3>
                                </Link>
                            </div>
                            {profile.videos && profile.videos.length > 0 ? (
                                <VideoGrid
                                    videos={profile.videos}
                                    mini={true}
                                />
                            ) : (
                                <p className="text-gray-600 italic">
                                    No videos uploaded yet
                                </p>
                            )}
                        </div>
                    )
                })}
            </InfiniteScroller>
        </div>
    )
}

export default ProfilesView

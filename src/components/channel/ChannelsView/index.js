import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroller"
import { Link } from "gatsby"

import "./channels.scss"
import { getProfiles } from "@utils/3box"
import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import { getChannelsWithVideos } from "@utils/ethernaResources/channelResources"
import * as Routes from "@routes"

const FETCH_COUNT = 10

const ChannelsView = () => {
    const [channels, setChannels] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchChannels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchChannels = async () => {
        try {
            const fetchedChannels = await getChannelsWithVideos(
                page,
                FETCH_COUNT,
                5
            )
            const boxProfiles = await getProfiles(
                fetchedChannels.map(p => p.address)
            )
            const mappedProfiles = fetchedChannels.map(p => {
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

            setChannels(channels.concat(mappedProfiles))

            if (fetchedChannels.length < FETCH_COUNT) {
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
        <div className="channels">
            <InfiniteScroller
                loadMore={fetchChannels}
                hasMore={hasMore}
                initialLoad={false}
                threshold={30}
            >
                {channels.map(channel => {
                    return (
                        <div className="channel-preview" key={channel.address}>
                            <div className="channel-info">
                                <Link
                                    to={Routes.getChannelLink(channel.address)}
                                >
                                    <Avatar
                                        image={channel.profileData.avatar}
                                        address={channel.address}
                                    />
                                </Link>
                                <Link
                                    to={Routes.getChannelLink(channel.address)}
                                >
                                    <h3>{channel.profileData.name}</h3>
                                </Link>
                            </div>
                            {channel.videos && channel.videos.length > 0 ? (
                                <VideoGrid
                                    videos={channel.videos}
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

export default ChannelsView

import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroller"

import "./channels.scss"
import ChannelPreview from "../ChannelPreview"
import ChannelPreviewPlaceholder from "../ChannelPreviewPlaceholder"
import { getProfiles } from "@utils/swarmProfile"
import { getChannelsWithVideos } from "@utils/ethernaResources/channelResources"

const FETCH_COUNT = 10

const ChannelsView = () => {
    const [channels, setChannels] = useState(undefined)
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
            const mappedProfiles = fetchedChannels.map(c => {
                const boxProfile =
                    boxProfiles.find(bp => bp.address === c.address) || {}
                const videos = (c.videos || []).map(v => ({
                    ...v,
                    profileData: boxProfile,
                }))
                return {
                    ...c,
                    videos,
                    profileData: boxProfile,
                }
            })

            setChannels((channels || []).concat(mappedProfiles))

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
            {channels === undefined && (
                <ChannelPreviewPlaceholder />
            )}

            <InfiniteScroller
                loadMore={fetchChannels}
                hasMore={hasMore}
                initialLoad={false}
                threshold={30}
            >
                {!channels && (
                    <div></div>
                )}
                {channels && channels.map(channel => {
                    return (
                        <ChannelPreview
                            channelAddress={channel.address}
                            avatar={channel.profileData.avatar}
                            name={channel.profileData.name}
                            videos={channel.videos}
                            key={channel.address}
                        />
                    )
                })}
            </InfiniteScroller>
        </div>
    )
}

export default ChannelsView

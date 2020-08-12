import React, { useState, useEffect } from "react"
import InfiniteScroller from "react-infinite-scroller"

import "./channels.scss"

import ChannelPreview from "../ChannelPreview"
import ChannelPreviewPlaceholder from "../ChannelPreviewPlaceholder"
import useSelector from "@state/useSelector"

const FETCH_COUNT = 10

const ChannelsView = () => {
  const { indexClient } = useSelector(state => state.env)
  const [channels, setChannels] = useState(undefined)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchChannels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchChannels = async () => {
    // increment page to avoid requests at the same page
    setPage(page + 1)

    try {
      const fetchedChannels = await indexClient.users.fetchUsers(page, FETCH_COUNT)

      setChannels((channels || []).concat(fetchedChannels))

      if (fetchedChannels.length < FETCH_COUNT) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
      setChannels(channels || [])
      setHasMore(false)
    }
  }

  return (
    <div className="channels">
      {channels === undefined && <ChannelPreviewPlaceholder />}

      <InfiniteScroller
        loadMore={fetchChannels}
        hasMore={hasMore}
        initialLoad={false}
        threshold={30}
      >
        {!channels && <div></div>}
        {channels &&
          channels.map((channel, index) => (
            (
              <ChannelPreview
                channelAddress={channel.address}
                key={`${channel.address}-${index}`}
              />
            )
          ))}
      </InfiniteScroller>
    </div>
  )
}

export default ChannelsView

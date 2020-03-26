import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import InfiniteScroller from "react-infinite-scroller"
import { useSelector } from "react-redux"
import { Link } from "gatsby"

import "./channel.scss"
import Alert from "@common/Alert"
import Button from "@common/Button"
import SEO from "@components/layout/SEO"
import VideoGrid from "@components/media/VideoGrid"
import ProfileInfo from "@components/profile/ProfileInfo"
import { profileActions } from "@state/actions"
import { getChannelVideos, getChannel } from "@utils/ethernaResources/channelResources"
import * as Routes from "@routes"

const FETCH_COUNT = 50

const ChannelView = ({ channelAddress }) => {
    const { address } = useSelector(state => state.user)
    const [isFetching, setIsFetching] = useState(false)
    const [isCreatingChannel, setIsCreatingChannel] = useState(false)
    const [hasChannel, setHasChannel] = useState(false)
    const [channelVideos, setChannelVideos] = useState([])
    const [profileInfo, setProfileInfo] = useState(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [showChannelCreatedMessage, setShowChannelCreatedMessage] = useState(false)

    useEffect(() => {
        fetchChannel()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelAddress])

    useEffect(() => {
        mapVideosWithProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileInfo])

    const fetchChannel = async () => {
        setIsFetching(true)

        try {
            const channel = await getChannel(channelAddress)

            setHasChannel(!!channel)
            fetchVideos()
        } catch (error) {
            console.error(error)
            setIsFetching(false)
        }
    }

    const fetchVideos = async () => {
        setIsFetching(true)

        try {
            const videos = await getChannelVideos(
                channelAddress,
                page,
                FETCH_COUNT
            )
            setChannelVideos(page === 0 ? videos : channelVideos.concat(videos))

            if (videos.length < FETCH_COUNT) {
                setHasMore(false)
            } else {
                setPage(page + 1)
            }
        } catch (error) {
            console.error(error)
            setHasMore(false)
        }

        setIsFetching(false)
    }

    const mapVideosWithProfile = () => {
        if (!profileInfo) return
        let videos = channelVideos
        for (let video of videos) {
            video.profileData = {
                name: profileInfo.name,
                avatar: profileInfo.avatar,
            }
        }

        setChannelVideos(videos)
    }

    const createChannel = async () => {
        setIsCreatingChannel(true)

        const created = await profileActions.createChannel(channelAddress)

        setShowChannelCreatedMessage(created)
        setHasChannel(created)
        setIsCreatingChannel(false)
    }

    return (
        <>
            <SEO title={(profileInfo || {}).name || channelAddress} />
            <ProfileInfo
                profileAddress={channelAddress}
                actions={
                    <div className="flex ml-auto">
                        {address === channelAddress && !hasChannel && (
                            isCreatingChannel ?
                                <img
                                    src={require("@svg/animated/spinner.svg")}
                                    className="self-center"
                                    width="30"
                                    alt=""
                                /> :
                                <Button className="" action={createChannel} aspect="secondary">
                                    Create channel
                                </Button>
                        )}
                        {address === channelAddress && (
                            <Link
                                to={Routes.getChannelEditingLink(channelAddress)}
                                className="btn btn-primary ml-2"
                            >
                                {hasChannel ? 'Customize channel' : 'Customize profile'}
                            </Link>
                        )}
                    </div>
                }
                onFetchedProfile={profile => setProfileInfo(profile)}
            >
                {showChannelCreatedMessage && (
                    <Alert title="Congratulation!" type="success">
                        Your channel has been created and you're now an Ethernaut!
                    </Alert>
                )}
                {hasChannel && !isFetching && channelVideos.length === 0 && (
                    <p className="text-gray-500 text-center my-16">
                        This channel has yet to upload a video
                    </p>
                )}
                {channelVideos.length > 0 && (
                    <InfiniteScroller
                        loadMore={fetchVideos}
                        hasMore={hasMore}
                        initialLoad={false}
                        threshold={30}
                    >
                        <VideoGrid videos={channelVideos} mini={true} />
                    </InfiniteScroller>
                )}
            </ProfileInfo>
        </>
    )
}

ChannelView.propTypes = {
    channelAddress: PropTypes.string,
}

export default ChannelView

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import "./channel.scss"

import ChannelAbout from "./ChannelAbout"
import ChannelVideos from "./ChannelVideos"
import Alert from "@common/Alert"
import Button from "@common/Button"
import NavPills from "@common/NavPills"
import SEO from "@components/layout/SEO"
import ProfileInfo from "@components/profile/ProfileInfo"
import { profileActions } from "@state/actions"
import useSelector from "@state/useSelector"
import { fetchFullVideosInfo } from "@utils/video"
import Routes from "@routes"

const FETCH_COUNT = 50

const ChannelView = ({ channelAddress }) => {
  const prefetchProfile = window.prefetchData && window.prefetchData.profile
  const prefetchVideos = window.prefetchData && window.prefetchData.videos

  const { address } = useSelector(state => state.user)
  const { indexClient, isMobile } = useSelector(state => state.env)

  const [activeTab, setActiveTab] = useState("videos")
  const [isFetching, setIsFetching] = useState(false)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [hasChannel, setHasChannel] = useState(false)
  const [channelVideos, setChannelVideos] = useState([])
  const [profileInfo, setProfileInfo] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showChannelCreatedMessage, setShowChannelCreatedMessage] = useState(false)

  useEffect(() => {
    // fetch channel
    fetchChannel()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelAddress])

  useEffect(() => {
    mapVideosWithProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileInfo])

  const fetchChannel = async () => {
    if (profileInfo && profileInfo.address !== channelAddress) {
      // reset
      setHasChannel(false)
      setChannelVideos([])
      setProfileInfo(null)
      setPage(0)
      setHasMore(true)
    }

    setIsFetching(true)

    try {
      const channel =
        prefetchVideos && prefetchProfile.address === channelAddress
          ? null
          : await indexClient.users.fetchUser(channelAddress)

      setHasChannel(!!channel)
      fetchVideos()
    } catch (error) {
      console.error(error)
      setIsFetching(false)
    }
  }

  const fetchVideos = async () => {
    setIsFetching(true)

    const hasPrefetch = prefetchVideos && prefetchProfile.address === channelAddress

    try {
      const videos = hasPrefetch
        ? prefetchVideos
        : await fetchFullVideosInfo(page, FETCH_COUNT, false, channelAddress)
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
    if (!profileInfo || !channelVideos) return

    const videos = channelVideos.map(v => ({
      ...v,
      profileData: {
        name: profileInfo.name,
        avatar: profileInfo.avatar,
        address: profileInfo.address,
      },
    }))
    setChannelVideos(videos)
  }

  const createChannel = async () => {
    setIsCreatingChannel(true)

    const created = await profileActions.createChannel(channelAddress)

    setShowChannelCreatedMessage(created)
    setHasChannel(created)
    setIsCreatingChannel(false)
  }

  const handleFetchedProfile = profile => {
    setProfileInfo(profile)
  }

  return (
    <>
      <SEO title={(profileInfo || {}).name || channelAddress} />
      <ProfileInfo
        profileAddress={channelAddress}
        nav={
          <NavPills.Container vertical={!isMobile} className="mt-10">
            <NavPills.Pill active={activeTab === "videos"} onClick={() => setActiveTab("videos")}>
              Videos
            </NavPills.Pill>
            <NavPills.Pill active={activeTab === "about"} onClick={() => setActiveTab("about")}>
              About
            </NavPills.Pill>
          </NavPills.Container>
        }
        actions={
          <div className="flex ml-auto">
            {address === channelAddress &&
              !hasChannel &&
              (isCreatingChannel ? (
                <img
                  src={require("@svg/animated/spinner.svg")}
                  className="self-center"
                  width="30"
                  alt=""
                />
              ) : (
                <Button className="" action={createChannel} aspect="secondary">
                  Create channel
                </Button>
              ))}
            {address === channelAddress && (
              <Link
                to={Routes.getChannelEditingLink(channelAddress)}
                className="btn btn-primary ml-2"
              >
                {hasChannel ? "Customize channel" : "Customize profile"}
              </Link>
            )}
          </div>
        }
        onFetchedProfile={handleFetchedProfile}
      >
        {showChannelCreatedMessage && (
          <Alert title="Congratulation!" type="success">
            Your channel has been created and you're now an Ethernaut!
          </Alert>
        )}
        {activeTab === "videos" && (
          <ChannelVideos
            hasChannel={hasChannel}
            hasMoreVideos={hasMore}
            isFetching={isFetching}
            onLoadMore={fetchVideos}
            videos={channelVideos}
          />
        )}
        {activeTab === "about" && (
          <ChannelAbout
            address={channelAddress}
            description={profileInfo.description}
            name={profileInfo.name}
          />
        )}
      </ProfileInfo>
    </>
  )
}

ChannelView.propTypes = {
  channelAddress: PropTypes.string,
}

export default ChannelView

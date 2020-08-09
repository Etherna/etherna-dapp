import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import "./channel-preview.scss"

import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import Routes from "@routes"
import { getProfile } from "@utils/swarmProfile"
import { shortenEthAddr } from "@utils/ethFuncs"
import { fetchFullVideosInfo } from "@utils/video"

const ChannelPreview = ({ channelAddress }) => {
  const [isFetchingChannel, setIsFetchingChannel] = useState(false)
  const [hasMappedVideosProfile, setHasMappedVideosProfile] = useState(false)
  const [profile, setProfile] = useState(undefined)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    mapVideosProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, videos])

  const fetchProfile = async () => {
    setIsFetchingChannel(true)

    try {
      const profile = await getProfile(channelAddress)
      setProfile(profile)
    } catch (error) {
      console.error(error)
    }

    setIsFetchingChannel(false)
  }

  const fetchVideos = async () => {
    try {
      const videos = await fetchFullVideosInfo(0, 5, false, channelAddress)
      setVideos(videos)
    } catch (error) {
      console.error(error)
    }
  }

  const mapVideosProfile = () => {
    if (!profile || hasMappedVideosProfile || !videos.length) return

    const mappedVideos = videos.map(v => ({
      ...v,
      profileData: profile,
    }))

    setVideos(mappedVideos)

    setHasMappedVideosProfile(true)
  }

  if (isFetchingChannel || !profile) return null

  return (
    <div className="channel-preview" key={channelAddress}>
      <div className="channel-info">
        <Link to={Routes.getChannelLink(channelAddress)}>
          <Avatar image={profile.avatar} address={channelAddress} />
        </Link>
        <Link to={Routes.getChannelLink(channelAddress)}>
          <h3>{profile.name || shortenEthAddr(channelAddress)}</h3>
        </Link>
      </div>
      {videos && hasMappedVideosProfile && (
        <VideoGrid videos={videos} mini={true} />
      )}
      {videos && !videos.length && (
        <p className="text-gray-600 italic">No videos uploaded yet</p>
      )}
    </div>
  )
}

ChannelPreview.propTypes = {
  channelAddress: PropTypes.string.isRequired,
}

export default ChannelPreview

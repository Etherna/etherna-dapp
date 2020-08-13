import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import "./profile-preview.scss"

import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import Routes from "@routes"
import { getProfile } from "@utils/swarmProfile"
import { shortenEthAddr } from "@utils/ethFuncs"
import { fetchFullVideosInfo } from "@utils/video"

const ProfilePreview = ({ profileAddress, profileManifest }) => {
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
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
    setIsFetchingProfile(true)

    try {
      const profile = await getProfile(profileManifest, profileAddress)
      setProfile(profile)
    } catch (error) {
      console.error(error)
    }

    setIsFetchingProfile(false)
  }

  const fetchVideos = async () => {
    try {
      const videos = await fetchFullVideosInfo(0, 5, false, profileAddress)
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

  if (isFetchingProfile || !profile) return null

  return (
    <div className="profile-preview" key={profileAddress}>
      <div className="profile-info">
        <Link to={Routes.getProfileLink(profileAddress)}>
          <Avatar image={profile.avatar} address={profileAddress} />
        </Link>
        <Link to={Routes.getProfileLink(profileAddress)}>
          <h3>{profile.name || shortenEthAddr(profileAddress)}</h3>
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

ProfilePreview.propTypes = {
  profileManifest: PropTypes.string,
  profileAddress: PropTypes.string.isRequired,
}

export default ProfilePreview
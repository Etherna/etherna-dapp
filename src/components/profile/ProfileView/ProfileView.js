import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import "./profile.scss"

import ProfileAbout from "./ProfileAbout"
import ProfileVideos from "./ProfileVideos"
import NavPills from "@common/NavPills"
import SEO from "@components/layout/SEO"
import ProfileInfo from "@components/profile/ProfileInfo"
import useSelector from "@state/useSelector"
import { fetchFullVideosInfo } from "@utils/video"
import Routes from "@routes"

const FETCH_COUNT = 50

const ProfileView = ({ profileAddress }) => {
  const prefetchProfile = window.prefetchData && window.prefetchData.profile
  const prefetchVideos = window.prefetchData && window.prefetchData.videos

  const { address } = useSelector(state => state.user)
  const { isMobile } = useSelector(state => state.env)

  const [activeTab, setActiveTab] = useState("videos")
  const [isFetching, setIsFetching] = useState(false)
  const [profileVideos, setProfileVideos] = useState([])
  const [profileInfo, setProfileInfo] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    mapVideosWithProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileInfo])

  const fetchProfile = async () => {
    if (profileInfo && profileInfo.address !== profileAddress) {
      // reset
      setProfileVideos([])
      setProfileInfo(null)
      setPage(0)
      setHasMore(true)
    }

    fetchVideos()
  }

  const fetchVideos = async () => {
    setIsFetching(true)

    const hasPrefetch = prefetchVideos && prefetchProfile.address === profileAddress

    try {
      const videos = hasPrefetch
        ? prefetchVideos
        : await fetchFullVideosInfo(page, FETCH_COUNT, false, profileAddress)
      setProfileVideos(page === 0 ? videos : profileVideos.concat(videos))

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
    if (!profileInfo || !profileVideos) return

    const videos = profileVideos.map(v => ({
      ...v,
      profileData: {
        name: profileInfo.name,
        avatar: profileInfo.avatar,
        address: profileInfo.address,
      },
    }))
    setProfileVideos(videos)
  }

  const handleFetchedProfile = profile => {
    setProfileInfo(profile)
  }

  return (
    <>
      <SEO title={(profileInfo || {}).name || profileAddress} />
      <ProfileInfo
        profileAddress={profileAddress}
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
            {address === profileAddress && (
              <Link
                to={Routes.getProfileEditingLink(profileAddress)}
                className="btn btn-primary ml-2"
              >
                Customize profile
              </Link>
            )}
          </div>
        }
        onFetchedProfile={handleFetchedProfile}
      >
        {activeTab === "videos" && (
          <ProfileVideos
            hasMoreVideos={hasMore}
            isFetching={isFetching}
            onLoadMore={fetchVideos}
            videos={profileVideos}
          />
        )}
        {activeTab === "about" && (
          <ProfileAbout
            address={profileAddress}
            description={profileInfo.description}
            name={profileInfo.name}
          />
        )}
      </ProfileInfo>
    </>
  )
}

ProfileView.propTypes = {
  profileAddress: PropTypes.string,
}

export default ProfileView

import React, { useState } from "react"
import { Link } from "react-router-dom"

import "./profile.scss"

import ProfileAbout from "./ProfileAbout"
import ProfileVideos from "./ProfileVideos"
import NavPills from "@common/NavPills"
import SEO from "@components/layout/SEO"
import ProfileInfo from "@components/profile/ProfileInfo"
import Routes from "@routes"
import { Profile } from "@classes/SwarmProfile/types"
import useSelector from "@state/useSelector"
import useSwarmVideos from "@hooks/useSwarmVideos"

type ProfileViewProps = {
  profileAddress: string
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileAddress }) => {
  const [profile, setProfile] = useState<Profile>()
  const { videos, hasMore, isFetching, loadMore } = useSwarmVideos({
    ownerAddress: profileAddress,
    profileData: profile
  })

  const { address } = useSelector(state => state.user)
  const { isMobile } = useSelector(state => state.env)

  const [activeTab, setActiveTab] = useState("videos")

  const handleFetchedProfile = (profile: Profile) => {
    setProfile(profile)
  }

  return (
    <>
      <SEO title={profile?.name ?? profileAddress} />
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
            onLoadMore={loadMore}
            videos={videos ?? []}
          />
        )}
        {activeTab === "about" && (
          <ProfileAbout
            address={profileAddress}
            description={profile?.description}
            name={profile?.name}
          />
        )}
      </ProfileInfo>
    </>
  )
}

export default ProfileView

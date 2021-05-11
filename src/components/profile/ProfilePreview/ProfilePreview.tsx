import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import "./profile-preview.scss"

import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/video/VideoGrid"
import Routes from "@routes"
import useSwarmProfile from "@hooks/useSwarmProfile"
import useSwarmVideos from "@hooks/useSwarmVideos"
import { shortenEthAddr } from "@utils/ethFuncs"

type ProfilePreviewProps = {
  profileAddress: string
  profileManifest?: string
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profileAddress, profileManifest }) => {
  const { profile, loadProfile } = useSwarmProfile({ address: profileAddress, hash: profileManifest })
  const { videos } = useSwarmVideos({ ownerAddress: profileAddress, profileData: profile, seedLimit: 5 })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  if (!profile) return null

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
      {videos && (
        <VideoGrid videos={videos} mini={true} />
      )}
      {videos && !videos.length && (
        <p className="text-gray-600 italic">No videos uploaded yet</p>
      )}
    </div>
  )
}

export default ProfilePreview

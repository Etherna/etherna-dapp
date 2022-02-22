/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import classes from "@styles/components/profile/ProfilePreview.module.scss"

import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/video/VideoGrid"
import Routes from "@routes"
import useSwarmProfile from "@hooks/useSwarmProfile"
import useUserPlaylists from "@hooks/useUserPlaylists"
import usePlaylistVideos from "@hooks/usePlaylistVideos"
import { shortenEthAddr } from "@utils/ethereum"

type ProfilePreviewProps = {
  profileAddress: string
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profileAddress }) => {
  const { profile, loadProfile } = useSwarmProfile({ address: profileAddress })
  const { channelPlaylist, loadPlaylists } = useUserPlaylists(profileAddress, { resolveChannel: true })
  const { videos, isFetching, loadMore } = usePlaylistVideos(channelPlaylist, {
    owner: profile ? profile : undefined,
    waitProfile: true,
    autofetch: true,
    limit: 5,
  })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    profile && loadPlaylists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (!profile) return null

  return (
    <div className={classes.profilePreview} key={profileAddress}>
      <div className={classes.profileInfo}>
        <Link to={Routes.getProfileLink(profileAddress)}>
          <Avatar image={profile?.avatar} address={profileAddress} />
        </Link>
        <Link to={Routes.getProfileLink(profileAddress)}>
          <h3>{profile.name || shortenEthAddr(profileAddress)}</h3>
        </Link>
      </div>
      {videos && (
        <VideoGrid videos={videos} mini={true} isFetching={isFetching} fetchingPreviewCount={5} />
      )}
      {videos && !videos.length && (
        <p className="text-gray-600 italic">No videos uploaded yet</p>
      )}
    </div>
  )
}

export default ProfilePreview

import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import "./profiles.scss"
import { getProfiles } from "@utils/3box"
import * as Routes from "@routes"
import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"
import { getChannelsWithVideos } from "@utils/ethernaResources/channelResources"

const ProfilesView = () => {
    const [profiles, setProfiles] = useState([])

    const fetchProfiles = async (page = 0) => {
        try {
            const fetchedProfiles = await getChannelsWithVideos(page, 10, 5)
            const boxProfiles = await getProfiles(fetchedProfiles.map(p => p.address))
            const mappedProfiles = fetchedProfiles.map(p => {
                const boxProfile = boxProfiles.find(bp => bp.address === p.address) || {}
                const videos = (p.videos || []).map(v => ({
                    ...v,
                    profileData: boxProfile
                }))
                return {
                    ...p,
                    videos,
                    profileData: boxProfile
                }
            })

            setProfiles(profiles.concat(mappedProfiles))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="profiles">
            {profiles.map(profile => {
                return <div className="profile-preview" key={profile.address}>
                    <div className="profile-info">
                        <Link to={Routes.getProfileLink(profile.address)}>
                            <Avatar image={profile.profileData.avatar} address={profile.address} />
                        </Link>
                        <Link to={Routes.getProfileLink(profile.address)}>
                            <h3>{profile.profileData.name}</h3>
                        </Link>
                    </div>
                    {
                        profile.videos && profile.videos.length > 0 ?
                            <VideoGrid videos={profile.videos} mini={true} /> :
                            <p className="text-gray-600 italic">No videos uploaded yet</p>
                    }
                </div>
            })}
        </div>
    )
}

export default ProfilesView

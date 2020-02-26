import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import "./profiles.scss"
import { getProfile } from "@utils/3box"
import * as Routes from "@routes"
import Avatar from "@components/user/Avatar"
import VideoGrid from "@components/media/VideoGrid"

const profileAddresses = [
    "0x9A0359B17651Bf2C5e25Fa9eFF49B11B3d4b1aE8",
    "0x71b183205423e5c9647D4E77BfFb30Faa9509687"
]

const videoHashes = [
    "33f1ea45b3404d1691911729a5dd618216bbd2031c9bf1459d4f4542fb13e067/test%20swarm.mp4",
    "efb99be236211420ca6bc3e12cd88baf543777d5a933a69091dfa215dbc166d6",
    "33f1ea45b3404d1691911729a5dd618216bbd2031c9bf1459d4f4542fb13e067/test%20swarm.mp4",
    "efb99be236211420ca6bc3e12cd88baf543777d5a933a69091dfa215dbc166d6",
]

const ProfilesView = () => {
    const [profiles, setProfiles] = useState([])

    useEffect(() => {
        loadProfiles(profileAddresses)
    }, [])

    const loadProfiles = async (addresses) => {
        let profiles = []
        for (const profileAddress of addresses) {
            try {
                const profile = await getProfile(profileAddress)
                profiles.push({
                    address: profileAddress,
                    profileData: profile,
                    videos: videoHashes.map(h => ({
                        title: "",
                        duration: 0,
                        hash: h,
                        profileAddress
                    }))
                })
            } catch (error) {
                console.error(error)
            }
        }
        setProfiles(profiles)
    }

    return (
        <div className="profiles">
            {profiles.map(profile => {
                return <div className="profile-preview" key={profile.address}>
                    <div className="profile-info">
                        <Link to={Routes.getProfileLink(profile.address)}>
                            <Avatar image={profile.profileData.image} address={profile.address} />
                        </Link>
                        <Link to={Routes.getProfileLink(profile.address)}>
                            <h3>{profile.profileData.name}</h3>
                        </Link>
                    </div>
                    <VideoGrid videos={profile.videos} mini={true} />
                </div>
            })}
        </div>
    )
}

export default ProfilesView

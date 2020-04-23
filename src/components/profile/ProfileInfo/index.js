import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import "./profile-info.scss"
import { shortenEthAddr } from "@utils/ethFuncs"
import makeBlockies from "@utils/makeBlockies"
import { isImageObject, getResourceUrl } from "@utils/swarm"
import { getProfile } from "@utils/swarmProfile"

const ProfileInfo = ({
    children,
    profileAddress,
    actions,
    onFetchedProfile,
}) => {
    const prefetchProfile = window.prefetchData && window.prefetchData.profile

    const [profileName, setProfileName] = useState("")
    const [profileDescription, setProfileDescription] = useState("")
    const [profileAvatar, setProfileAvatar] = useState(undefined)
    const [profileCover, setProfileCover] = useState("")

    useEffect(() => {
        // reset data
        setProfileName("")
        setProfileDescription("")
        setProfileAvatar(undefined)
        // fetch data
        fetchProfile()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileAddress])

    const fetchProfile = async () => {
        //setIsFetchingProfile(true)

        const hasPrefetch = prefetchProfile && prefetchProfile.address === profileAddress

        try {
            const { name, description, avatar, cover } = hasPrefetch
                ? prefetchProfile
                : await getProfile(profileAddress)
            const fallbackName = name || shortenEthAddr(profileAddress)

            setProfileName(fallbackName)
            setProfileDescription(description)
            setProfileAvatar(avatar)
            setProfileCover(cover)

            onFetchedProfile({
                name: fallbackName,
                avatar,
                address: profileAddress
            })
        } catch (error) {
            console.error(error)
        }

        //setIsFetchingProfile(false)
    }

    return (
        <div className="profile">
            {profileCover.url && (
                <div className="cover">
                    <img
                        src={profileCover.url}
                        alt={profileName}
                        className="cover-image"
                    />
                </div>
            )}

            <div className="row items-center px-4">
                <div className="profile-avatar">
                    <img
                        src={
                            profileAvatar.url
                                ? profileAvatar.url
                                : makeBlockies(profileAddress)
                        }
                        alt={profileName}
                    />
                </div>
                {actions}
            </div>

            <div className="row">
                <div className="col sm:w-1/3 md:w-1/4 p-4">
                    <h1 className="profile-name">{profileName}</h1>
                    <p className="profile-bio">{profileDescription}</p>
                </div>
                <div className="col sm:w-2/3 md:w-3/4 p-4">
                    {/* Main content */}
                    {children}
                </div>
            </div>
        </div>
    )
}

ProfileInfo.propTypes = {
    profileAddress: PropTypes.string.isRequired,
    actions: PropTypes.element,
    onFetchedProfile: PropTypes.func,
}

export default ProfileInfo

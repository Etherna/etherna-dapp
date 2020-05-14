import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import "./profile-info.scss"
import { getProfile } from "@utils/3box"
import { shortenEthAddr } from "@utils/ethFuncs"
import makeBlockies from "@utils/makeBlockies"
import { isImageObject, getResourceUrl } from "@utils/swarm"

const ProfileInfo = ({
    children,
    nav,
    profileAddress,
    actions,
    onFetchedProfile,
}) => {
    const prefetchProfile = window.prefetchData && window.prefetchData.profile

    const [profileName, setProfileName] = useState("")
    const [profileAvatar, setProfileAvatar] = useState(undefined)
    const [profileCover, setProfileCover] = useState("")

    useEffect(() => {
        // reset data
        setProfileName("")
        setProfileAvatar(undefined)
        // fetch data
        fetchProfile()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileAddress])

    const fetchProfile = async () => {
        //setIsFetchingProfile(true)

        const hasPrefetch =
            prefetchProfile && prefetchProfile.address === profileAddress

        try {
            const { name, description, avatar, cover } = hasPrefetch
                ? prefetchProfile
                : await getProfile(profileAddress)
            const fallbackName = name || shortenEthAddr(profileAddress)

            setProfileName(fallbackName)
            setProfileAvatar(avatar)
            setProfileCover(cover)

            onFetchedProfile({
                name: fallbackName,
                avatar,
                description,
                address: profileAddress,
            })
        } catch (error) {
            console.error(error)
        }

        //setIsFetchingProfile(false)
    }

    return (
        <div className="profile">
            <div className="cover">
                {isImageObject(profileCover) && (
                    <img
                        src={getResourceUrl(profileCover)}
                        alt={profileName}
                        className="cover-image"
                    />
                )}
            </div>

            <div className="row items-center">
                <div className="col max-w-xxs px-4">
                    <div className="profile-avatar">
                        <img
                            src={
                                isImageObject(profileAvatar)
                                    ? getResourceUrl(profileAvatar)
                                    : makeBlockies(profileAddress)
                            }
                            alt={profileName}
                        />
                    </div>
                </div>
                <div className="col flex-1 px-4">
                    <div className="flex">
                        {actions}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col max-w-xxs p-4">
                    <h1 className="profile-name">{profileName}</h1>
                    {nav}
                </div>
                <div className="col flex-1 p-4">
                    {/* Main content */}
                    {children}
                </div>
            </div>
        </div>
    )
}

ProfileInfo.propTypes = {
    profileAddress: PropTypes.string.isRequired,
    nav: PropTypes.element,
    actions: PropTypes.element,
    onFetchedProfile: PropTypes.func,
}

export default ProfileInfo

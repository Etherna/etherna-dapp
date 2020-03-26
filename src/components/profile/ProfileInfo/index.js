import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import "./profile-info.scss"
import { getProfile } from "@utils/3box"
import { shortenEthAddr } from "@utils/ethFuncs"
import makeBlockies from "@utils/makeBlockies"
import { isImageObject, getResourceUrl } from "@utils/swarm"

const ProfileInfo = ({
    children,
    profileAddress,
    actions,
    onFetchedProfile,
}) => {
    //const [isFetchingProfile, setIsFetchingProfile] = useState(false)
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

        try {
            const { name, description, avatar, cover } = await getProfile(
                profileAddress
            )
            const fallbackName = name || shortenEthAddr(profileAddress)

            setProfileName(fallbackName)
            setProfileDescription(description)
            setProfileAvatar(avatar)
            setProfileCover(cover)

            onFetchedProfile({
                name: fallbackName,
                avatar,
            })
        } catch (error) {
            console.error(error)
        }

        //setIsFetchingProfile(false)
    }

    return (
        <div className="profile">
            {isImageObject(profileCover) && (
                <div className="cover">
                    <img
                        src={getResourceUrl(profileCover)}
                        alt={profileName}
                        className="cover-image"
                    />
                </div>
            )}

            <div className="row items-center px-4">
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

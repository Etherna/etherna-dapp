import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import makeBlockies from "ethereum-blockies-base64"
import { useSelector } from "react-redux"
import { Link, navigate } from "gatsby"

import "./profile.scss"
import SEO from "@components/layout/SEO"
import { isImageObject, getResourceUrl } from "@utils/swarm"
import { getProfile } from "@utils/3box"
import * as Routes from "@routes"

const ProfileView = ({ profileAddress }) => {
    const { address } = useSelector(state => state.user)
    const [currentProfileAddress, setCurrentProfileAddress] = useState(
        undefined
    )
    const [profileName, setProfileName] = useState("")
    const [profileDescription, setProfileDescription] = useState("")
    const [profileAvatar, setProfileAvatar] = useState("")
    const [profileCover, setProfileCover] = useState("")

    useEffect(() => {
        if (currentProfileAddress !== profileAddress) {
            setCurrentProfileAddress(profileAddress)

            getProfile(profileAddress)
                .then(profileData => {
                    const {
                        name,
                        description,
                        image,
                        coverPhoto
                    } = profileData

                    if (!name || name === "") {
                        // we consider a no-name profile a non existing profile
                        navigate("/404")
                        return
                    }
                    setProfileName(name)
                    setProfileDescription(description)
                    setProfileAvatar(image)
                    setProfileCover(coverPhoto)
                })
                .catch(error => {
                    console.error(error)
                    navigate("/404")
                })
        }
    }, [currentProfileAddress, profileAddress])

    return (
        <>
            <SEO title={profileName || ""} />
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
                                isImageObject(profileAvatar) ?
                                    getResourceUrl(profileAvatar) :
                                    makeBlockies(profileAddress)
                            }
                            alt={profileName}
                        />
                    </div>
                    {address && address === profileAddress && (
                        <Link
                            to={Routes.getProfileEditingLink(profileAddress)}
                            className="btn ml-auto self-center"
                        >
                            Customize profile
                        </Link>
                    )}
                </div>

                <div className="row">
                    <div className="col sm:w-1/3 md:w-1/4 p-4">
                        <h1 className="profile-name">{profileName}</h1>
                        <p className="profile-bio">{profileDescription}</p>
                    </div>
                    <div className="col sm:w-2/3 md:w-3/4 p-4">
                        <p className="text-gray-500 text-center my-16">
                            This profile has yet to upload a video
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

ProfileView.propTypes = {
    profileAddress: PropTypes.string,
}

export default ProfileView

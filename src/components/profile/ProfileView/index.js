import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import InfiniteScroller from "react-infinite-scroller"
import { useSelector } from "react-redux"
import { Link, navigate } from "gatsby"

import "./profile.scss"
import SEO from "@components/layout/SEO"
import { getProfile } from "@utils/3box"
import VideoGrid from "@components/media/VideoGrid"
import makeBlockies from "@utils/makeBlockies"
import { getChannelVideos } from "@utils/ethernaResources/channelResources"
import { isImageObject, getResourceUrl } from "@utils/swarm"
import * as Routes from "@routes"

const FETCH_COUNT = 50

const ProfileView = ({ profileAddress }) => {
    const { address } = useSelector(state => state.user)
    const [currentProfileAddress, setCurrentProfileAddress] = useState(
        undefined
    )
    const [isFetchingProfile, setIsFetchingProfile] = useState(false)
    const [profileName, setProfileName] = useState("")
    const [profileDescription, setProfileDescription] = useState("")
    const [profileAvatar, setProfileAvatar] = useState(undefined)
    const [profileCover, setProfileCover] = useState("")
    const [profileVideos, setProfileVideos] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (currentProfileAddress !== profileAddress) {
            // reset data
            setCurrentProfileAddress(profileAddress)
            setProfileName("")
            setProfileDescription("")
            setProfileAvatar(undefined)
            setProfileVideos([])
            // fetch data
            fetchProfileAndVideos()
        }
    })

    const fetchProfileAndVideos = async () => {
        setIsFetchingProfile(true)

        try {
            const { name, description, avatar, cover } = await getProfile(
                profileAddress
            )

            if (!name || name === "") {
                // we consider a no-name profile a non existing profile
                navigate("/404")
                return
            }

            setProfileName(name)
            setProfileDescription(description)
            setProfileAvatar(avatar)
            setProfileCover(cover)

            fetchVideos()
        } catch (error) {
            console.error(error)
        }

        setIsFetchingProfile(false)
    }

    const fetchVideos = async () => {
        try {
            let videos = await getChannelVideos(profileAddress, page, FETCH_COUNT)
            for (let video of videos) {
                video.profileData = {
                    name: profileName,
                    avatar: profileAvatar,
                }
            }
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
    }

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
                                isImageObject(profileAvatar)
                                    ? getResourceUrl(profileAvatar)
                                    : makeBlockies(profileAddress)
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
                        {!isFetchingProfile && profileVideos.length === 0 && (
                            <p className="text-gray-500 text-center my-16">
                                This profile has yet to upload a video
                            </p>
                        )}
                        {profileVideos.length > 0 && (
                            <InfiniteScroller
                                loadMore={fetchVideos}
                                hasMore={hasMore}
                                initialLoad={false}
                                threshold={30}
                            >
                                <VideoGrid videos={profileVideos} mini={true} />
                            </InfiniteScroller>
                        )}
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

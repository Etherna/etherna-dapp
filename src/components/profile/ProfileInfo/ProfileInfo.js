import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import "./profile-info.scss"

import SwarmImage from "@components/common/SwarmImage"
import useSelector from "@state/useSelector"
import profileActions from "@state/actions/profile"
import makeBlockies from "@utils/makeBlockies"
import { getProfile } from "@utils/swarmProfile"
import { checkIsEthAddress, shortenEthAddr } from "@utils/ethFuncs"

const ProfileInfo = ({ children, nav, profileAddress, actions, onFetchedProfile }) => {
  const prefetchProfile = window.prefetchData && window.prefetchData.profile

  const { indexClient } = useSelector(state => state.env)
  const { address } = useSelector(state => state.user)
  const isCurrentUser = address === profileAddress

  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState({})
  const [profileCover, setProfileCover] = useState({})

  useEffect(() => {
    // reset data
    setProfileName("")
    setProfileAvatar({})
    setProfileCover({})
    // fetch data
    fetchProfile()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  const fetchProfile = async () => {
    //setIsFetchingProfile(true)

    const hasPrefetch = prefetchProfile && prefetchProfile.address === profileAddress

    try {
      let { name, description, avatar, cover } = hasPrefetch ? prefetchProfile : {}

      if (!hasPrefetch) {
        let swarmProfile = {}

        if (isCurrentUser) {
          swarmProfile = profileActions.getCurrentUserProfile()
        } else {
          const indexProfile = await indexClient.users.fetchUser(profileAddress)
          swarmProfile = await getProfile(indexProfile.identityManifest, profileAddress)
        }

        name = swarmProfile.name
        description = swarmProfile.description
        avatar = swarmProfile.avatar
        cover = swarmProfile.cover
      }
      const fallbackName = name || profileAddress

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
        {profileCover.url && (
          <SwarmImage
            hash={profileCover.hash}
            alt={profileName}
            className="cover-image"
          />
        )}
      </div>

      <div className="row items-center">
        <div className="col md:max-w-xxs px-4">
          <div className="profile-avatar">
            <SwarmImage
              hash={profileAvatar.hash}
              fallback={makeBlockies(profileAddress)}
              alt={profileName}
            />
          </div>
        </div>
        <div className="col flex-1 px-4">
          <div className="flex">{actions}</div>
        </div>
      </div>

      <div className="row">
        <div className="col md:max-w-xxs p-4">
          <h1 className="profile-name">
            {checkIsEthAddress(profileName)
              ? shortenEthAddr(profileName)
              : profileName || shortenEthAddr(profileName)}
          </h1>
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

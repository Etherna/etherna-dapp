import React, { useEffect, useState } from "react"

import "./profile-info.scss"

import { default as SwarmImg } from "@components/common/SwarmImage"
import useSelector from "@state/useSelector"
import profileActions from "@state/actions/profile"
import makeBlockies from "@utils/makeBlockies"
import { getProfile, Profile, SwarmImage } from "@utils/swarmProfile"
import { checkIsEthAddress, shortenEthAddr } from "@utils/ethFuncs"
import { WindowPrefetchData } from "@typings/window"

type ProfileInfoProps = {
  children: React.ReactNode
  profileAddress: string
  nav?: React.ReactNode
  actions?: React.ReactNode
  onFetchedProfile: (profile: Profile) => void
}

const ProfileInfo = ({
  children,
  profileAddress,
  nav,
  actions,
  onFetchedProfile
}: ProfileInfoProps) => {
  const windowPrefetch = window as WindowPrefetchData
  const prefetchProfile = windowPrefetch.prefetchData?.profile

  const { indexClient } = useSelector(state => state.env)
  const { address } = useSelector(state => state.user)
  const isCurrentUser = address === profileAddress

  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState<SwarmImage>()
  const [profileCover, setProfileCover] = useState<SwarmImage>()

  useEffect(() => {
    // reset data
    setProfileName("")
    setProfileAvatar(undefined)
    setProfileCover(undefined)
    // fetch data
    fetchProfile()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  const fetchProfile = async () => {
    //setIsFetchingProfile(true)

    const hasPrefetch = prefetchProfile && prefetchProfile.address === profileAddress

    try {
      const defaultProfile = hasPrefetch ? prefetchProfile! : {} as Profile
      let { name, description, avatar, cover } = defaultProfile

      if (!hasPrefetch) {
        let swarmProfile: Profile = {} as Profile

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
        {profileCover?.url && (
          <SwarmImg
            hash={profileCover?.hash}
            alt={profileName}
            className="cover-image"
          />
        )}
      </div>

      <div className="row items-center">
        <div className="col md:max-w-xxs px-4">
          <div className="profile-avatar">
            <SwarmImg
              hash={profileAvatar?.hash}
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

export default ProfileInfo

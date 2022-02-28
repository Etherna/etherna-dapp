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

import classes from "@styles/components/profile/ProfileInfo.module.scss"

import Image from "@common/Image"
import ProfileInfoPlaceholder from "@components/placeholders/ProfileInfoPlaceholder"
import useSwarmProfile from "@hooks/useSwarmProfile"
import useErrorMessage from "@state/hooks/ui/useErrorMessage"
import makeBlockies from "@utils/makeBlockies"
import { checkIsEthAddress, shortenEthAddr } from "@utils/ethereum"
import type { Profile } from "@definitions/swarm-profile"

type ProfileInfoProps = {
  children: React.ReactNode
  profileAddress: string
  nav?: React.ReactNode
  actions?: React.ReactNode
  onFetchedProfile: (profile: Profile) => void
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  children,
  profileAddress,
  nav,
  actions,
  onFetchedProfile
}) => {
  const { profile, isLoading, loadProfile } = useSwarmProfile({ address: profileAddress })
  const profileName = profile?.name ? profile.name : profileAddress
  const { showError } = useErrorMessage()

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    if (profile) {
      onFetchedProfile(profile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const fetchProfile = async () => {
    try {
      await loadProfile()
    } catch (error: any) {
      console.error(error)
      showError("Error", "Failed to fetch the profile information")
    }
  }

  return (
    <div className={classes.profile}>
      <div className={classes.cover}>
        {profile?.cover && (
          <Image
            className={classes.coverImage}
            sources={profile.cover.sources}
            placeholder="blur"
            blurredDataURL={profile.cover.blurredBase64}
            layout="responsive"
            aspectRatio={profile.cover.aspectRatio}
            alt={profileName}
          />
        )}
      </div>

      {isLoading ? (
        <ProfileInfoPlaceholder>{children}</ProfileInfoPlaceholder>
      ) : (
        <>
          <div className="row items-center">
            <div className="col md:max-w-xxs px-4">
              <div className={classes.profileAvatar}>
                <Image
                  sources={profile?.avatar?.sources}
                  placeholder="blur"
                  blurredDataURL={profile?.avatar?.blurredBase64}
                  layout="fill"
                  fallbackSrc={makeBlockies(profileAddress)}
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
              <h1 className={classes.profileName}>
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
        </>
      )}
    </div>
  )
}

export default ProfileInfo

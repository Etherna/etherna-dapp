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
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import Image from "@/components/common/Image"
import { Skeleton } from "@/components/ui/display"
import type { Profile } from "@/definitions/swarm-profile"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import useErrorMessage from "@/state/hooks/ui/useErrorMessage"
import { shortenEthAddr } from "@/utils/ethereum"
import makeBlockies from "@/utils/makeBlockies"
import { getResponseErrorMessage } from "@/utils/request"

type ProfileInfoProps = {
  children: React.ReactNode
  profileAddress: string
  nav?: React.ReactNode
  actions?: React.ReactNode
  onFetchedProfile: (profile: Profile | null) => void
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  children,
  profileAddress,
  nav,
  actions,
  onFetchedProfile,
}) => {
  const { profile, isLoading, loadProfile } = useSwarmProfile({ address: profileAddress })
  const profileName = profile?.name ? profile.name : profileAddress
  const { showError } = useErrorMessage()

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    onFetchedProfile(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const fetchProfile = async () => {
    try {
      await loadProfile()
    } catch (error: any) {
      console.error(error)
      showError("Error", getResponseErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-wrap" data-component="profile-info">
      <div className="flex items-center w-full min-h-24 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        {profile?.cover && (
          <Image
            className="w-full h-auto"
            sources={profile.cover.sources}
            placeholder="blur"
            blurredDataURL={profile.cover.blurredBase64}
            layout="responsive"
            aspectRatio={profile.cover.aspectRatio}
            alt={profileName}
          />
        )}
      </div>

      <header className="p-4 flex items-start w-full">
        <div className={classNames("-mt-8 shrink-0 md:w-56 md:pr-4")}>
          <span
            className={classNames(
              "relative flex border-4 rounded-full overflow-hidden",
              "w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40",
              "border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"
            )}
          >
            <Skeleton show={isLoading}>
              <Image
                className="object-cover"
                sources={profile?.avatar?.sources}
                placeholder="blur"
                blurredDataURL={profile?.avatar?.blurredBase64}
                layout="fill"
                fallbackSrc={makeBlockies(profileAddress)}
                alt={profileName}
              />
            </Skeleton>
          </span>
        </div>
        <div
          className={classNames(
            "flex flex-col w-full ml-4 md:ml-0 space-y-4",
            "md:space-y-0 md:space-x-4 md:flex-row md:items-start md:justify-between"
          )}
        >
          <Skeleton show={isLoading}>
            <Tippy content={profile?.name ?? profileAddress}>
              <h1
                className={classNames(
                  "mb-0 flex-grow overflow-hidden break-all",
                  "leading-[2.25rem] text-2xl font-semibold text-left",
                  "text-gray-900 dark:text-gray-100"
                )}
              >
                {profile?.name ?? shortenEthAddr(profileAddress)}
              </h1>
            </Tippy>
          </Skeleton>
          <div className="shrink-0 grid auto-cols-min gap-3">
            <div className="flex">{actions}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full md:flex-row">
        <div className="shrink-0 w-full md:max-w-xxs p-4">{nav}</div>
        <div className="flex-1 p-4">
          {/* Main content */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo

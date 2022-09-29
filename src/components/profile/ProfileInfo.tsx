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

import React, { useCallback, useEffect } from "react"
import type { Profile } from "@etherna/api-js"
import type { EthAddress } from "@etherna/api-js/clients"
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import Image from "@/components/common/Image"
import { Skeleton } from "@/components/ui/display"
import useErrorMessage from "@/hooks/useErrorMessage"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import { shortenEthAddr } from "@/utils/ethereum"
import makeBlockies from "@/utils/make-blockies"
import { getResponseErrorMessage } from "@/utils/request"

type ProfileInfoProps = {
  children: React.ReactNode
  profileAddress: EthAddress
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

  const fetchProfile = useCallback(async () => {
    try {
      await loadProfile()
    } catch (error: any) {
      console.error(error)
      showError("Error", getResponseErrorMessage(error))
    }
  }, [loadProfile, showError])

  return (
    <div className="flex flex-wrap" data-component="profile-info">
      <div className="flex min-h-24 w-full items-center overflow-hidden bg-gray-200 dark:bg-gray-800">
        {profile?.cover && (
          <Image
            className="h-auto w-full"
            sources={profile.cover.sources}
            placeholder="blur"
            blurredDataURL={profile.cover.blurredBase64}
            layout="responsive"
            aspectRatio={profile.cover.aspectRatio}
            alt={profileName}
          />
        )}
      </div>

      <header className="flex w-full items-start p-4">
        <div className={classNames("-mt-8 shrink-0 md:w-56 md:pr-4")}>
          <span
            className={classNames(
              "relative mx-auto flex overflow-hidden rounded-full border-4",
              "h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40",
              "border-white bg-gray-200 dark:border-gray-700/30 dark:bg-gray-700"
            )}
          >
            <Skeleton show={isLoading}>
              <Image
                className="mx-auto object-cover"
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
            "ml-4 flex w-full flex-col space-y-4 md:ml-0",
            "md:flex-row md:items-start md:justify-between md:space-y-0 md:space-x-4"
          )}
        >
          <Skeleton show={isLoading}>
            <Tippy content={profile?.name ?? profileAddress}>
              <h1
                className={classNames(
                  "mb-0 flex-grow overflow-hidden break-all",
                  "text-left text-2xl font-semibold leading-[2.25rem]",
                  "text-gray-900 dark:text-gray-100"
                )}
              >
                {profile?.name ?? shortenEthAddr(profileAddress)}
              </h1>
            </Tippy>
          </Skeleton>
          <div className="grid shrink-0 auto-cols-min gap-3">
            <div className="flex">{actions}</div>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col md:flex-row">
        <div className="w-full shrink-0 p-4 md:max-w-xxs">{nav}</div>
        <div className="flex-1 p-4">
          {/* Main content */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo

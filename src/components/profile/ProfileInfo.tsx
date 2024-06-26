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
import { isEthAddress } from "@etherna/sdk-js/utils"

import Image from "@/components/common/Image"
import { Skeleton } from "@/components/ui/display"
import useErrorMessage from "@/hooks/useErrorMessage"
import useSwarmProfile from "@/hooks/useSwarmProfile"
import routes from "@/routes"
import { cn } from "@/utils/classnames"
import makeBlockies from "@/utils/make-blockies"
import { getResponseErrorMessage } from "@/utils/request"

import type { Profile } from "@etherna/sdk-js"
import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ProfileInfoProps = {
  children: React.ReactNode
  profileAddress: EthAddress | EnsAddress
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
  const { profile, isLoading, loadProfile } = useSwarmProfile({
    mode: "full",
    address: profileAddress,
  })
  const profileName = profile?.preview.name ? profile?.preview.name : profileAddress
  const { showError } = useErrorMessage()

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileAddress])

  useEffect(() => {
    onFetchedProfile(profile)

    if (isEthAddress(profileAddress) && profile?.ens) {
      window.history.replaceState({}, "", routes.channel(profile.ens))
    }
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
    <div
      className="mx-auto flex w-full max-w-screen-2xl flex-col px-4"
      data-component="profile-info"
    >
      <div className="relative flex min-h-24 flex-grow items-center overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 lg:min-h-32">
        {profile?.details?.cover && (
          <Image
            className="absolute inset-0"
            sources={profile.details.cover.sources}
            placeholder="blur"
            blurredDataURL={profile.details.cover.blurredBase64}
            layout="responsive"
            aspectRatio={profile.details.cover.aspectRatio}
            alt={profileName}
          />
        )}
      </div>

      <header className="mt-4 flex w-full items-start">
        <div className={cn("shrink-0 md:w-56")}>
          <span
            className={cn(
              "relative mx-auto flex overflow-hidden rounded-full border-4",
              "h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40",
              "border-white bg-gray-200 dark:border-gray-700/30 dark:bg-gray-700"
            )}
          >
            <Skeleton show={isLoading}>
              <Image
                className="mx-auto object-cover"
                sources={profile?.preview.avatar?.sources}
                placeholder="blur"
                blurredDataURL={profile?.preview.avatar?.blurredBase64}
                layout="fill"
                fallbackSrc={makeBlockies(profileAddress)}
                alt={profileName}
              />
            </Skeleton>
          </span>
        </div>
        <div
          className={cn(
            "ml-4 flex w-full flex-col space-y-4 md:ml-0",
            "md:flex-row md:items-start md:justify-between md:space-x-4 md:space-y-0"
          )}
        >
          <div className="flex flex-grow flex-col items-start">
            <Skeleton show={isLoading}>
              <h1
                className={cn(
                  "mb-0 overflow-hidden break-all",
                  "text-left text-2xl/none font-semibold",
                  "text-gray-900 dark:text-gray-100",
                  {
                    "text-gray-400 dark:text-gray-500": !profile?.preview.name,
                  }
                )}
              >
                {profile?.preview.name || "Unknown channel name"}
              </h1>
            </Skeleton>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              @{profile?.ens || profileAddress}
            </p>
          </div>
          <div className="grid shrink-0 auto-cols-min gap-3">
            <div className="flex">{actions}</div>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col md:flex-row">
        <div className="w-full shrink-0 p-4 md:max-w-xxs">{nav}</div>
        <div className="flex-1 overflow-x-hidden py-4">
          {/* Main content */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo

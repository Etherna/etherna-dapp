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

import React from "react"

import Image from "@/components/common/Image"
import TextCollapser from "@/components/common/TextCollapser"
import { Button } from "@/components/ui/actions"
import { Skeleton } from "@/components/ui/display"
import { useProfileQuery } from "@/queries/profile-query"
import routes from "@/routes"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"
import makeBlockies from "@/utils/make-blockies"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ProfileHeaderProps = {
  address: EthAddress | EnsAddress
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ address }) => {
  const userAddress = useUserStore(state => state.address)
  const profileQuery = useProfileQuery({
    address,
  })

  const profile = profileQuery.data

  return (
    <div className="space-y-8">
      {profile?.details?.cover && (
        <div className="relative w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
          <Image
            className="absolute inset-0 object-cover"
            sources={profile?.details.cover?.sources}
            placeholder="blur"
            blurredDataURL={profile?.details.cover?.blurredBase64}
            layout="fill"
            alt={(profile?.preview.name ?? address) + " cover"}
          />
        </div>
      )}

      <div className="grid w-full grid-cols-[auto,1fr] grid-rows-[auto,auto,auto,auto] gap-x-4 gap-y-0 overflow-hidden md:gap-x-8 lg:gap-x-12">
        <div className="sm:row-span-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-white bg-gray-100 dark:border-gray-800/30 dark:bg-gray-800 sm:size-32 md:size-40">
            {profileQuery.isLoading ? (
              <Skeleton className="absolute inset-0" />
            ) : (
              <Image
                className="absolute inset-0 object-cover"
                sources={profile?.preview.avatar?.sources}
                placeholder="blur"
                blurredDataURL={profile?.preview.avatar?.blurredBase64}
                layout="fill"
                fallbackSrc={makeBlockies(profile?.preview.address ?? address)}
                alt={profile?.preview.name ?? address}
              />
            )}
          </div>
        </div>
        <div className="col-start-2 overflow-hidden">
          <div>
            {profileQuery.isLoading ? (
              <Skeleton className="block h-6 w-52" />
            ) : (
              <h1
                className={cn(
                  "line-clamp-1 text-ellipsis break-all text-2xl/none font-semibold text-gray-900 dark:text-gray-100",
                  {
                    "text-gray-400 dark:text-gray-500": !profile?.preview.name,
                  }
                )}
              >
                {profile?.preview.name || "Unknown channel name"}
              </h1>
            )}
          </div>
          <div className="mt-1">
            {profileQuery.isLoading ? (
              <Skeleton className="block h-4 w-36" />
            ) : (
              <p className="line-clamp-1 text-ellipsis break-all text-sm text-gray-600 dark:text-gray-400">
                @{profile?.ens || address}
              </p>
            )}
          </div>
        </div>
        {profile?.details?.description && (
          <div className="col-span-full mt-4 overflow-hidden sm:col-span-1 md:col-start-2">
            <TextCollapser
              buttonClassName="mr-auto"
              text={profile.details.description}
              previewLines={2}
            />
          </div>
        )}
        {address === userAddress && (
          <div className="col-span-full mt-8 flex flex-wrap gap-2 overflow-hidden sm:col-span-1 md:col-start-2">
            <Button as="a" to={routes.studioChannel} color="info" rounded small>
              Customize
            </Button>
            <Button as="a" to={routes.studioVideos} color="info" rounded small>
              Manage videos
            </Button>
            <Button as="a" to={routes.studioPlaylists} color="info" rounded small>
              Manage playlists
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileHeader

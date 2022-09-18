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

import { Avatar } from "@/components/ui/display"
import routes from "@/routes"
import type { Profile } from "@/types/swarm-profile"
import { shortenEthAddr } from "@/utils/ethereum"

type PlayerVideoInfoProps = {
  hash: string
  title: string
  owner: Profile | undefined
}

const PlayerVideoInfo: React.FC<PlayerVideoInfoProps> = ({ hash, title, owner }) => {
  return (
    <a
      className="flex items-center text-lg font-medium"
      href={import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(hash)}
      target="_blank"
      rel="noreferrer"
    >
      {owner && (
        <div className="relative mr-3 h-8 w-8 rounded-full shadow-sm shadow-black/25 md:h-12 md:w-12">
          <Avatar size="fill" image={owner.avatar} address={owner.address} />
        </div>
      )}
      <div className="inline-flex items-baseline space-x-2 text-white shadow-black/75 drop-shadow">
        <span>{title}</span>
        {owner && (
          <>
            <span>|</span>
            <span>{owner.name || shortenEthAddr(owner.address)}</span>
          </>
        )}
      </div>
    </a>
  )
}

export default PlayerVideoInfo

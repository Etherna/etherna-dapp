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
import { Link } from "react-router-dom"

import { Avatar } from "@/components/ui/display"
import routes from "@/routes"
import classNames from "@/utils/classnames"
import { shortenEthAddr } from "@/utils/ethereum"

import type { Profile } from "@etherna/api-js"

type VideoDetailsProfileProps = {
  owner?: Profile | null
}

const VideoDetailsProfile: React.FC<VideoDetailsProfileProps> = ({ owner }) => {
  return (
    <div className="mb-4 mt-8">
      {owner?.address && (
        <Link to={routes.channel(owner.address)}>
          <div className="inline-flex items-center">
            <Avatar image={owner.avatar} address={owner.address} />
            <h3
              className={classNames(
                "mb-0 ml-2 text-base font-semibold",
                "text-gray-800 dark:text-gray-300"
              )}
            >
              {owner.name || shortenEthAddr(owner.address)}
            </h3>
          </div>
        </Link>
      )}
    </div>
  )
}

export default VideoDetailsProfile

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

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import { PencilIcon, SparklesIcon, UserCircleIcon } from "@heroicons/react/24/solid"

import { Dropdown } from "@/components/ui/actions"
import { Avatar } from "@/components/ui/display"
import routes from "@/routes"
import useUserStore from "@/stores/user"
import { checkIsEthAddress, shortenEthAddr } from "@/utils/ethereum"

const SignedInMenuItems: React.FC = () => {
  const profile = useUserStore(state => state.profile)
  const address = useUserStore(state => state.address)

  return (
    <>
      <Dropdown.Group>
        <Dropdown.Item disabled>
          <Avatar image={profile?.avatar} address={address} />
          <div className="ml-2 flex flex-1 flex-col items-start overflow-hidden">
            <span className="w-full overflow-hidden text-ellipsis text-left">
              {checkIsEthAddress(profile?.name)
                ? shortenEthAddr(profile?.name)
                : profile?.name || shortenEthAddr(address)}
            </span>
            {profile?.name && <small className="text-gray-500">{shortenEthAddr(address)}</small>}
          </div>
        </Dropdown.Item>

        <Dropdown.Item href={routes.channel(address!)} icon={<UserCircleIcon />}>
          View channel
        </Dropdown.Item>
      </Dropdown.Group>

      <Dropdown.Separator />

      <Dropdown.Group>
        <Dropdown.Item href={routes.studio} icon={<SparklesIcon />}>
          Creator Studio
        </Dropdown.Item>
        <Dropdown.Item href={routes.studioChannel} icon={<PencilIcon />}>
          Customize channel
        </Dropdown.Item>
        <Dropdown.Item href={routes.studioVideoNew} icon={<ArrowUpTrayIcon strokeWidth={2} />}>
          Upload a video
        </Dropdown.Item>
      </Dropdown.Group>

      <Dropdown.Separator />
    </>
  )
}

export default SignedInMenuItems

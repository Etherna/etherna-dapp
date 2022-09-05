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

import { UserCircleIcon, UploadIcon } from "@heroicons/react/outline"
import { PencilIcon, SparklesIcon } from "@heroicons/react/solid"

import { Dropdown } from "@/components/ui/actions"
import { Avatar } from "@/components/ui/display"
import routes from "@/routes"
import useSelector from "@/state/useSelector"
import { checkIsEthAddress, shortenEthAddr } from "@/utils/ethereum"

const SignedInMenuItems: React.FC = () => {
  const { name, avatar } = useSelector(state => state.profile)
  const { address } = useSelector(state => state.user)

  return (
    <>
      <Dropdown.Item disabled>
        <Avatar image={avatar} address={address} />
        <div className="flex flex-col flex-1 items-start ml-2 overflow-hidden">
          <span className="w-full text-ellipsis overflow-hidden text-left">
            {checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(address)}
          </span>
          {name && <small className="text-gray-500">{shortenEthAddr(address)}</small>}
        </div>
      </Dropdown.Item>

      <Dropdown.Item href={routes.channel(address!)} icon={<UserCircleIcon />}>
        View channel
      </Dropdown.Item>

      <hr />

      <Dropdown.Item href={routes.studio} icon={<SparklesIcon />}>
        Creator Studio
      </Dropdown.Item>
      <Dropdown.Item href={routes.studioChannel} icon={<PencilIcon />}>
        Customize channel
      </Dropdown.Item>
      <Dropdown.Item href={routes.studioVideoNew} icon={<UploadIcon />}>
        Upload a video
      </Dropdown.Item>

      <hr />
    </>
  )
}

export default SignedInMenuItems

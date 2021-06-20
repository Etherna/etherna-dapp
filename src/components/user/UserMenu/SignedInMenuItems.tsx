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

import { ReactComponent as EditIcon } from "@svg/icons/edit-icon.svg"
import { ReactComponent as ProfileIcon } from "@svg/icons/profile-icon.svg"
import { ReactComponent as UploadIcon } from "@svg/icons/upload-icon.svg"

import { DropdownItem } from "@common/Dropdown"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import routes from "@routes"
import { checkIsEthAddress, shortenEthAddr } from "@utils/ethFuncs"

const SignedInMenuItems: React.FC = () => {
  const { name, avatar } = useSelector(state => state.profile)
  const { address } = useSelector(state => state.user)

  return (
    <>
      <DropdownItem disabled>
        <Avatar image={avatar} address={address} />
        <div className="flex flex-col flex-1 ml-2">
          <span>
            {checkIsEthAddress(name) ? shortenEthAddr(name) : name || shortenEthAddr(address)}
          </span>
          {name && (
            <small className="text-gray-500">{shortenEthAddr(address)}</small>
          )}
        </div>
      </DropdownItem>

      <hr />

      <DropdownItem href={routes.getProfileLink(address!)} icon={<ProfileIcon />}>
        View profile
      </DropdownItem>
      <DropdownItem href={routes.getProfileEditingLink(address!)} icon={<EditIcon />}>
        Edit profile
      </DropdownItem>
      <DropdownItem href={routes.getVideoUploadLink()} icon={<UploadIcon />}>
        Upload a video
      </DropdownItem>

      <hr />
    </>
  )
}

export default SignedInMenuItems

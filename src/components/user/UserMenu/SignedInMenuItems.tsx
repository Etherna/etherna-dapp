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
        <div className="flex flex-col flex-1 items-start ml-2">
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

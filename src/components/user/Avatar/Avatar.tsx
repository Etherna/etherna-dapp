import React from "react"
import classnames from "classnames"

import "./avatar.scss"

import SwarmImg from "@components/common/SwarmImg"
import makeBlockies from "@utils/makeBlockies"
import SwarmImage from "@classes/SwarmImage"

type AvatarProps = {
  image?: string | SwarmImage
  address?: string
  size?: number
  showBadge?: boolean
}

const Avatar: React.FC<AvatarProps> = ({ image, address, size, showBadge }) => {
  const blockie = address ? makeBlockies(address) : undefined

  return (
    <div className={classnames("avatar", { badge: showBadge })}>
      <SwarmImg
        image={image}
        fallback={blockie}
        style={{
          width: size ? `${size}px` : undefined,
          height: size ? `${size}px` : undefined,
        }}
      />
    </div>
  )
}

export default Avatar

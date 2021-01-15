import React from "react"
import classnames from "classnames"

import "./avatar.scss"

import { default as SwarmImg } from "@components/common/SwarmImage"
import makeBlockies from "@utils/makeBlockies"
import { SwarmImage } from "@utils/swarmProfile"

type AvatarProps = {
  image?: string | SwarmImage
  address?: string
  size?: number
  showBadge?: boolean
}

const Avatar = ({ image, address, size, showBadge }: AvatarProps) => {
  const blockie = address ? makeBlockies(address) : undefined

  return (
    <div className={classnames("avatar", { badge: showBadge })}>
      <SwarmImg
        hash={image}
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

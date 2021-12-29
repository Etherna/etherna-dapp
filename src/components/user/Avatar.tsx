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
import classNames from "classnames"

import classes from "@styles/components/user/Avatar.module.scss"

import Image from "@common/Image"
import makeBlockies from "@utils/makeBlockies"
import type { SwarmImage } from "@definitions/swarm-image"

type AvatarProps = {
  image?: string | SwarmImage | null
  address?: string | null
  size?: number
  showBadge?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ image, address, size, showBadge, className }) => {
  const blockie = address ? makeBlockies(address) : undefined
  const src = !image ? blockie : undefined

  return (
    <div
      className={classNames(classes.avatar, className, { [classes.badge]: showBadge })}
      style={{
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
      }}
    >
      <Image
        src={src}
        sources={typeof image === "object" ? image?.sources : undefined}
        placeholder={typeof image === "object" ? "blur" : "empty"}
        blurredDataURL={typeof image === "object" ? image?.blurredBase64 : undefined}
        layout="fill"
        objectFit="cover"
        fallbackSrc={blockie}
        placeholderClassName="rounded-full"
      />
    </div>
  )
}

export default Avatar

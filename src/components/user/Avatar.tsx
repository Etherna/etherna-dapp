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

import SwarmImg from "@common/SwarmImg"
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
    <div className={classNames(classes.avatar, { [classes.badge]: showBadge })}>
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

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

import Image from "@/components/common/Image"
import { cn } from "@/utils/classnames"
import makeBlockies from "@/utils/make-blockies"

import type { Image as SwarmImage } from "@etherna/sdk-js"

export type AvatarProps = {
  image?: string | SwarmImage | null
  address?: string | null
  size?: number | "fill"
  showBadge?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ image, address, size = 40, showBadge, className }) => {
  const blockie = address ? makeBlockies(address) : undefined
  const src = !image ? blockie : undefined

  return (
    <div
      className={cn(
        "relative flex shrink-0",
        {
          "h-full w-full": size === "fill",
        },
        className
      )}
      style={{
        width: size && size !== "fill" ? `${size}px` : undefined,
        height: size && size !== "fill" ? `${size}px` : undefined,
      }}
      data-component="avatar"
    >
      <Image
        className="h-full w-full flex-grow overflow-hidden rounded-full"
        imgClassName="object-cover"
        placeholderClassName="rounded-full overflow-hidden"
        src={src}
        sources={typeof image === "object" ? image?.sources : undefined}
        placeholder={typeof image === "object" ? "blur" : "empty"}
        blurredDataURL={typeof image === "object" ? image?.blurredBase64 : undefined}
        layout="fill"
        objectFit="cover"
        fallbackSrc={blockie}
      />

      {showBadge && (
        <span
          className={cn(
            "absolute right-0 top-0 h-3 w-3 rounded-full",
            "border border-white bg-blue-600 dark:border-gray-900"
          )}
        />
      )}
    </div>
  )
}

export default Avatar

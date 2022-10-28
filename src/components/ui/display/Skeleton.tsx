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

export type SkeletonProps = {
  children: React.ReactNode
  className?: string
  show?: boolean
  roundedFull?: boolean
  roundedThin?: boolean
  squared?: boolean
  width?: string | number
  height?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  children,
  className,
  show = true,
  roundedFull,
  roundedThin,
  squared,
  width,
  height,
}) => {
  if (!show) return <>{children}</>

  return (
    <span
      className={classNames(
        "inline-flex animate-pulse bg-gray-200 dark:bg-gray-600",
        "[&>*]:invisible",
        {
          "rounded-sm": roundedThin,
          "rounded-full": roundedFull,
          "rounded-md": !squared && !roundedFull && !roundedThin,
        },
        className
      )}
      style={{
        width,
        height,
      }}
      data-skeleton
    >
      {children}
    </span>
  )
}

export default Skeleton

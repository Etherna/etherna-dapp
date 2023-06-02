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

import classNames from "@/utils/classnames"

type VideoDetailsButtonProps = {
  children?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  onClick?(): void
}

const VideoDetailsButton: React.FC<VideoDetailsButtonProps> = ({
  children,
  icon,
  className,
  onClick,
}) => {
  return (
    <button
      className={classNames(
        "inline-flex items-center whitespace-nowrap bg-transparent",
        "rounded border-none px-2 py-1 font-medium",
        "text-gray-800 active:bg-gray-300 dark:text-gray-200 dark:active:bg-gray-700",
        className
      )}
      onClick={onClick}
    >
      {icon && <span className="mr-2 h-[1.2em]">{icon}</span>}
      {children}
    </button>
  )
}

export default VideoDetailsButton

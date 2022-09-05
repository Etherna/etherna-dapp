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

type VideoSourcePreviewProps = {
  children?: React.ReactNode
  name?: string
  statusText?: string
  error?: string
  actionsRender?: React.ReactNode
}

const VideoSourcePreview: React.FC<VideoSourcePreviewProps> = ({
  children,
  name,
  statusText,
  error,
  actionsRender,
}) => {
  return (
    <div className="">
      <div className="flex items-start flex-wrap">
        <span className="flex-shrink-0 text-3xl font-bold tracking-tight">{name}</span>

        <div className="flex items-center ml-auto space-x-4">
          {actionsRender && <span className="space-x-2">{actionsRender}</span>}
          {/* {error && (
            <span className="text-sm font-medium text-red-500 ml-3">{error}</span>
          )} */}
          {statusText && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-3">
              {statusText}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </div>
  )
}

export default VideoSourcePreview

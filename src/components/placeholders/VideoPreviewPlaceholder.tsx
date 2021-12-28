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

import Placeholder from "@common/Placeholder"
import classNames from "classnames"

type VideoPreviewPlaceholderProps = {
  mini?: boolean
}

const VideoPreviewPlaceholder: React.FC<VideoPreviewPlaceholderProps> = ({ mini }) => {
  return (
    <div className="flex flex-col">
      <Placeholder className="pt-[62%]" width="100%" height="100%" round="none" />
      <div className="flex items-top mt-2">
        {!mini && (
          <Placeholder width="2.5rem" height="2.5rem" round="full" />
        )}
        <div className={classNames("flex flex-col flex-1 mt-1", {
          "ml-2": !mini
        })}>
          <Placeholder width="100%" height="1rem" round="sm" />
          <Placeholder className="mt-1.5" width="40%" height="0.75rem" round="sm" />
        </div>
      </div>
    </div>
  )
}

export default VideoPreviewPlaceholder

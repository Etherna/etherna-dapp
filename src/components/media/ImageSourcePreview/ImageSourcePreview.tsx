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

import "./image-source-preview.scss"

import MediaStats from "@components/media/MediaStats"
import SwarmImage from "@classes/SwarmImage"

type ImageSourcePreviewProps = {
  image?: SwarmImage
}

const ImageSourcePreview: React.FC<ImageSourcePreviewProps> = ({
  image
}) => {
  return (
    <div className="image-source-preview">
      <img className="image-source-preview-img" src={image?.filePreview ?? image?.originalSource} alt="" />
      <div className="image-source-preview-stats">
        <MediaStats
          stats={[{
            label: "Hash",
            value: image?.originalReference ?? ""
          }, {
            label: "Download url",
            value: <a href={image?.originalSource} target="_blank" rel="noreferrer">{image?.originalSource}</a>
          }]}
          showText="Show info"
          hideText="Hide info"
        />
      </div>
    </div>
  )
}

export default ImageSourcePreview

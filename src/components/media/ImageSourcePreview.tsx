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

import React, { useMemo } from "react"

import classes from "@styles/components/media/ImageSourcePreview.module.scss"

import MediaStats from "@components/media/MediaStats"
import SwarmImageIO from "@classes/SwarmImage"
import useSelector from "@state/useSelector"
import type { SwarmImageRaw } from "@definitions/swarm-image"

type ImageSourcePreviewProps = {
  image?: SwarmImageRaw | null
}

const ImageSourcePreview: React.FC<ImageSourcePreviewProps> = ({
  image
}) => {
  const beeClient = useSelector(state => state.env.beeClient)

  const [reference, srcUrl] = useMemo(() => {
    const reference = SwarmImageIO.Reader.getOriginalSourceReference(image)
    const url = reference ? beeClient.getBzzUrl(reference) : undefined
    return [reference, url]
  }, [image, beeClient])

  return (
    <div className={classes.imageSourcePreview}>
      <img className={classes.imageSourcePreviewImg} src={srcUrl} alt="" />
      <div className={classes.imageSourcePreviewStats}>
        <MediaStats
          stats={[{
            label: "Hash",
            value: reference ?? ""
          }, {
            label: "Download url",
            value: <a href={srcUrl} target="_blank" rel="noreferrer">{srcUrl}</a>
          }]}
          showText="Show info"
          hideText="Hide info"
        />
      </div>
    </div>
  )
}

export default ImageSourcePreview

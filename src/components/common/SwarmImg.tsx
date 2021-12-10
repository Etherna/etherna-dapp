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

import React, { useEffect, useState } from "react"
import classNames from "classnames"

import classes from "@styles/components/common/SwarmImg.module.scss"

import SwarmImage from "@classes/SwarmImage"

type SwarmImgProps = {
  image?: string | SwarmImage
  fallback?: string
  className?: string
  alt?: string
  preserveAspectRatio?: boolean
  style?: React.CSSProperties
}

const SwarmImg: React.FC<SwarmImgProps> = ({ image, fallback, className, alt, preserveAspectRatio, style }) => {
  const [src, setSrc] = useState<string>()
  const [size, setSize] = useState<number>()
  const [imgLoaded, setImgLoaded] = useState(typeof image === "string")

  const imagePreload = image instanceof SwarmImage ? image.blurredBase64 : fallback

  useEffect(() => {
    if (image && size) {
      const src = image instanceof SwarmImage ? image.getOptimizedSrc(size) : image
      setSrc(src)
      setImgLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, size])

  const onLoadImage = () => {
    setImgLoaded(true)
  }

  const onError = () => {
    if (fallback || imagePreload) {
      setSrc(fallback || imagePreload)
    }
  }

  return (
    <div className={classNames(classes.swarmImg, className)} ref={el => {
      if (el && el.clientWidth !== size) {
        setSize(el.clientWidth)
      }
    }}>
      {!imgLoaded && imagePreload && (
        <img
          className={classes.swarmImgPreview}
          src={imagePreload}
          alt={alt}
          style={style}
          ref={el => {
            if (el && preserveAspectRatio && size && image instanceof SwarmImage) {
              const [width, height] = image.originalImageSize ?? [1, 1]
              const aspectRatio = height / width
              el.style.height = `${el.clientWidth * aspectRatio} px`
            }
          }}
        />
      )}
      {src && (
        <picture
          className={classes.swarmImgPicture}
          onError={onError}
          onLoad={onLoadImage}
        >
          <img
            src={src}
            alt={alt}
            style={style}
            loading="lazy"
          />
        </picture>
      )}
    </div>
  )
}

export default SwarmImg

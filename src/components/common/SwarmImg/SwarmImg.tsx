import React, { useState } from "react"
import classnames from "classnames"

import "./swarm-image.scss"

import SwarmImage from "@classes/SwarmImage"

type SwarmImgProps = {
  image?: string | SwarmImage
  fallback?: string
  className?: string
  alt?: string
  style?: React.CSSProperties
}

const SwarmImg: React.FC<SwarmImgProps> = ({ image, fallback, className, alt, style }) => {
  const srcValue = image instanceof SwarmImage ? image.originalSource : image
  const [imgLoaded, setImgLoaded] = useState(typeof image === "string")
  const [src, setSrc] = useState(srcValue || fallback)
  const [srcset, setSrcset] = useState(image instanceof SwarmImage ? image.srcset : image)

  const blurredSrc = image instanceof SwarmImage && image.blurredBase64

  const onLoadImage = () => {
    setImgLoaded(true)
  }

  const onError = () => {
    if (fallback) {
      setSrc(fallback)
      setSrcset(undefined)
    }
  }

  return (
    <div className={classnames("swarm-image", className)}>
      {!imgLoaded && blurredSrc && (
        <img
          className="swarm-image-preview"
          src={blurredSrc}
          alt={alt}
          style={style}
        />
      )}
      <picture className="swarm-image-picture">
        {srcset && (
          <source srcSet={srcset} />
        )}
        <img
          src={src}
          alt={alt}
          style={style}
          onError={onError}
          onLoad={onLoadImage}
        />
      </picture>
    </div>
  )
}

export default SwarmImg

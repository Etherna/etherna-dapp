import React, { useEffect, useState } from "react"
import classnames from "classnames"

import "./swarm-img.scss"

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
    <div className={classnames("swarm-image", className)} ref={el => {
      if (el && el.clientWidth !== size) {
        setSize(el.clientWidth)
      }
    }}>
      {!imgLoaded && imagePreload && (
        <img
          className="swarm-image-preview"
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
          className="swarm-image-picture"
          onError={onError}
          onLoad={onLoadImage}
        >
          <img
            src={src}
            alt={alt}
            style={style}
          />
        </picture>
      )}
    </div>
  )
}

export default SwarmImg

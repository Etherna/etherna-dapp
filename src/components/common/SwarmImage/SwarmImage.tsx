import React, { useState } from "react"

import { getResourceUrl, SwarmObject } from "@utils/swarm"

type SwarmImageProps = {
  hash?: string | SwarmObject
  fallback?: string
  className?: string
  alt?: string
  style?: React.CSSProperties
}

const SwarmImage = ({ hash, fallback, className, alt, style }: SwarmImageProps) => {
  const [useRawImage, setUseRawImage] = useState(false)
  const image = hash ? getResourceUrl(hash, false) || fallback : fallback
  const imageRaw = hash ? getResourceUrl(hash, true) || fallback : fallback

  return (
    <img
      src={useRawImage ? imageRaw : image}
      className={className}
      alt={alt}
      onError={() => setUseRawImage(true)}
      style={style}
    />
  )
}

export default SwarmImage

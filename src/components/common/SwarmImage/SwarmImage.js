import React, { useState } from "react"
import PropTypes from "prop-types"

import { getResourceUrl } from "@utils/swarm"

const SwarmImage = ({ hash, fallback, className, alt, style }) => {
  const [useRawImage, setUseRawImage] = useState(false)
  const image = hash ? getResourceUrl(hash, false) || fallback : fallback
  const imageRaw = hash ? getResourceUrl(hash, true) || fallback : fallback

  return (
    <img
      src={useRawImage ? imageRaw : image}
      className={className}
      alt={alt}
      onError={() => setUseRawImage(true)}
      style={{ ...style }}
    />
  )
}

SwarmImage.propTypes = {
  hash: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  fallback: PropTypes.string,
  className: PropTypes.string,
  alt: PropTypes.string,
  style: PropTypes.object,
}

SwarmImage.defaultProps = {
  alt: "",
  style: {},
}

export default SwarmImage

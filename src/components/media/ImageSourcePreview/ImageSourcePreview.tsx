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

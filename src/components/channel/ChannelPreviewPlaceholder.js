import React from "react"

import Placeholder from "@common/Placeholder"

const ChannelPreviewPlaceholder = () => {
  const rows = 5
  const arrayMap = [...Array(rows).keys()]

  const videos = 3
  const videosMap = [...Array(videos).keys()]

  return (
    <>
      {arrayMap.map(i => (
        <div className="channel-placeholder" key={i}>
          <div className="flex items-center py-2">
            <Placeholder width="2rem" height="2rem" round="full" />
            <Placeholder className="ml-2" width="10rem" height="1rem" />
          </div>
          <div className="flex">
            {videosMap.map(i => (
              <div className="flex flex-col mr-2" key={i}>
                <Placeholder width="16rem" height="8rem" />
                <Placeholder width="100%" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default ChannelPreviewPlaceholder

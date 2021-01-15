import React from "react"

import Placeholder from "@common/Placeholder"

const PlayerPlaceholder = () => {
  return (
    <>
      <Placeholder width="100%" ratio={0.42} className="mt-12 mb-8" round="lg" />
      <div className="flex flex-col">
        <Placeholder width="100%" height="1rem" round="sm" />
        <Placeholder className="mt-1" width="60%" height="0.75rem" round="sm" />
      </div>
    </>
  )
}

export default PlayerPlaceholder

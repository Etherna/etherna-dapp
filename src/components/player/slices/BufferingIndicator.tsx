import React from "react"

import { Spinner } from "@/components/ui/display"
import usePlayerStore from "@/stores/player"

const BufferingIndicator: React.FC = ({}) => {
  const isBuffering = usePlayerStore(state => state.isBuffering)

  if (!isBuffering) {
    return null
  }

  return <Spinner className="absolute-center" size={24} />
}

export default BufferingIndicator

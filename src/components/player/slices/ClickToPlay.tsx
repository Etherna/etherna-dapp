import React from "react"

import usePlayerStore from "@/stores/player"

type ClickToPlayProps = {}

const ClickToPlay: React.FC<ClickToPlayProps> = ({}) => {
  const togglePlay = usePlayerStore(state => state.togglePlay)

  return <div className="absolute inset-0" onClick={togglePlay} />
}

export default ClickToPlay

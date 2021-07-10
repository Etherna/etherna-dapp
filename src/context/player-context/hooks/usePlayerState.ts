import { useContext } from "react"

import { PlayerContext } from ".."

const usePlayerState = () => useContext(PlayerContext)!

export default usePlayerState

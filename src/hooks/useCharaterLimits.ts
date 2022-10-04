import { useCallback, useEffect, useState } from "react"

import useClientsStore from "@/stores/clients"
import useSessionStore from "@/stores/session"

type UseCharaterLimitsOptions = {
  autoFetch?: boolean
}

export default function useCharaterLimits(opts?: UseCharaterLimitsOptions) {
  const [isFetching, setIsFetching] = useState(false)
  const indexClient = useClientsStore(state => state.indexClient)
  const characterLimits = useSessionStore(state => state.characterLimits)
  const setCharaterLimits = useSessionStore(state => state.setCharaterLimits)

  useEffect(() => {
    if (characterLimits === undefined && opts?.autoFetch) {
      fetchCharLimits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterLimits, opts?.autoFetch])

  const fetchCharLimits = useCallback(async () => {
    setIsFetching(true)
    try {
      const { commentMaxLength, videoDescriptionMaxLength, videoTitleMaxLength } =
        await indexClient.system.fetchParameters()
      setCharaterLimits(commentMaxLength, videoTitleMaxLength, videoDescriptionMaxLength)
    } catch (error) {
      console.error(error)
      setCharaterLimits(2000, 100, 5000)
    } finally {
      setIsFetching(false)
    }
  }, [indexClient.system, setCharaterLimits])

  return {
    isFetching,
    characterLimits,
    fetchCharLimits,
  }
}

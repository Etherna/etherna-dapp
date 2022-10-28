import { useEffect, useRef } from "react"

import type { EffectCallback } from "react"

export default function useEffectOnce(effect: EffectCallback) {
  const didRun = useRef(false)
  const cleanup = useRef<ReturnType<EffectCallback> | undefined>()

  useEffect(() => {
    if (!didRun.current) {
      didRun.current = true
      cleanup.current = effect()
    }
    return cleanup.current
  }, [effect])
}

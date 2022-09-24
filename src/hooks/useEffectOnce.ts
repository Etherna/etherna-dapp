import type { EffectCallback } from "react"
import { useEffect, useRef } from "react"

export default function useEffectOnce(effect: EffectCallback) {
  const didRun = useRef(false)

  useEffect(() => {
    if (!didRun.current) {
      didRun.current = true
      return effect()
    }
  }, [effect])
}

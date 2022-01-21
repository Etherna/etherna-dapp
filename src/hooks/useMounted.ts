import { useEffect, useRef } from "react"

/**
 * Check if the current component is mounted or unmounting.
 * 
 * @returns Boolean ref value
 */
export default function useMounted() {
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}

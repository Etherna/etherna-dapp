import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function useResetRouteState() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(".", {
      replace: true,
      state: undefined,
    })
  }, [navigate])
}

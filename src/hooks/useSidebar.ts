import { useEffect, useState } from "react"

export default function useSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState<number>()

  useEffect(() => {
    function resize() {
      setSidebarWidth(sidebar.clientWidth)
    }

    const sidebar = document.querySelector("[data-sidebar]")!
    if (sidebar) {
      console.log(sidebar, sidebar.clientWidth, sidebar.scrollWidth)

      setSidebarWidth(sidebar.clientWidth)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(sidebar)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return {
    sidebarWidth,
  }
}

import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

type PortalProps = {
  selector: string
}

const Portal: React.FC<PortalProps> = ({ selector, children }) => {
  const [container, setContainer] = useState<HTMLElement>()

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(selector)
    container && setContainer(container)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!container) return null

  return ReactDOM.createPortal(children, container)
}

export default Portal

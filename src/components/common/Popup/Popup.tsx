import React, { useEffect, useRef, useState } from "react"
import classnames from "classnames"

import "./popup.scss"

type PopupProps = {
  children: React.ReactNode
  show: boolean
  center: [x: number, y: number]
  onClose?: () => void
}

const Popup = ({ children, show = false, center, onClose }: PopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  const [popupLeft, setPopupLeft] = useState(0)
  const [popupSize, setPopupSize] = useState([0, 0])
  const [arrowLeft, setArrowLeft] = useState(0)
  const [arrowHeight, setArrowHeight] = useState(0)

  const arrowOrigin = [arrowLeft, 0]
  const popupOrigin = [popupLeft, center[1]]

  useEffect(() => {
    if (!popupRef.current) return
    if (!popupRef.current.children.length) return

    const width = popupRef.current.scrollWidth
    const height = popupRef.current.scrollHeight

    if (width === 0 || height === 0) return

    let left = center[0] - width / 2
    left = left + width > document.body.clientWidth ? document.body.clientWidth - width : left
    left = left < 0 ? 0 : left

    setPopupLeft(left)
    setPopupSize([width, height + arrowHeight])
  }, [popupRef, arrowHeight, center])

  useEffect(() => {
    const width = (arrowRef.current && arrowRef.current.clientWidth) || 0

    if (width === 0) return

    const height = (arrowRef.current && arrowRef.current.clientHeight) || 0
    const left = (center[0] - width / 2) - popupLeft

    setArrowLeft(left)
    setArrowHeight(height)
  }, [arrowRef, popupLeft, center])

  return (
    <>
      <div
        className={classnames("popup", { show })}
        style={{
          left: `${popupOrigin[0]}px`,
          top: `${popupOrigin[1]}px`,
          width: `${popupSize[0]}px`,
          height: `${popupSize[1]}px`
        }}
      >
        <div
          className="popup-arrow"
          style={{ left: `${arrowOrigin[0]}px`, top: `${arrowOrigin[1]}px` }}
          ref={arrowRef}
        />
        <div
          className="popup-content"
          style={{ top: `${arrowOrigin[1] + arrowHeight - 1}px` }}
          ref={popupRef}
        >
          {children}
        </div>
      </div>
      {show && (
        <div className="popup-backdrop" onClick={onClose} />
      )}
    </>
  )
}

export default Popup

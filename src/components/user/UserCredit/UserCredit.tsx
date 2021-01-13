import React, { useEffect, useMemo, useRef, useState } from "react"
import classnames from "classnames"

import "./user-credit.scss"

import Button from "@common/Button"
import Popup from "@common/Popup"
import useSelector from "@state/useSelector"
import providerActions from "@state/actions/provider"

const UserCredit = () => {
  const { creditHost, bytePrice } = useSelector(state => state.env)
  const { credit, isSignedInGateway } = useSelector(state => state.user)
  const [isHover, setIsHover] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupCenter, setPopupCenter] = useState<[number, number]>([0, 0])
  const [creditWidth, setCreditWidth] = useState(0)
  const creditRef = useRef<HTMLSpanElement>(null)

  const maxWidth = 60
  const expandable = creditWidth > maxWidth
  const currentWidth = !expandable || isHover ? creditWidth : maxWidth
  const fixedCredit = `${+(credit || 0).toFixed(12)}`

  useEffect(() => {
    if (!creditRef.current) return

    const fullWidth = creditRef.current.scrollWidth || 0
    setCreditWidth(fullWidth)

    const creditBounds = creditRef.current.getBoundingClientRect()
    const width = creditBounds.width || (fullWidth < maxWidth ? fullWidth : maxWidth)
    const x = creditBounds.right - width / 2
    const y = creditBounds.bottom + 10
    setPopupCenter([x, y])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditRef])

  const gbReproduction = useMemo(() => {
    if (!credit || !bytePrice || bytePrice === 0) return "0.000"
    return +(credit / bytePrice * 0.000000001).toFixed(3)
  }, [credit, bytePrice])

  return (
    <div className="user-credit-wrapper">
      <div
        className={classnames("user-credit-badge", {
          expandable,
          "user-credit-badge-warning": false, // gbReproduction < 1 && gbReproduction >= 0.1,
          "user-credit-badge-danger": false, // gbReproduction < 0.1,
        })}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => setShowPopup(!showPopup)}
      >
        <span className="credit-text-sm">USD</span>
        <span className="credit-text-lg" style={{ width: `${currentWidth}px` }} ref={creditRef}>
          {fixedCredit}
        </span>
      </div>

      <Popup show={showPopup} center={popupCenter} onClose={() => setShowPopup(false)}>
        <div className="user-credit-popup">
          {isSignedInGateway ? (
            <>
              <p className="text-xs mb-4">You current balance is:</p>
              <p className="text-2xl font-bold break-all">{credit}</p>
              <span className="text-sm text-gray-600 dark:text-gray-400 tracking-tighter">USD</span>
              {bytePrice && (
                <p className="my-3 text-gray-600 dark:text-gray-400 text-sm">
                  This is equivalent to <strong className="text-md">{gbReproduction}</strong> GB of videos reprodution.
                </p>
              )}
              <div className="mt-8 mb-4">
                <a href={creditHost} className="btn btn-secondary" rel="noreferrer noopener" target="_blank">Get more credit</a>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs mb-4">You are not signed in the gateway</div>
              <div className="mt-8 mb-4">
                <Button size="small" outline={true} className="w-full" action={() => providerActions.signin(true, "gateway")}>
                  Sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </Popup>
    </div>
  )
}

export default UserCredit

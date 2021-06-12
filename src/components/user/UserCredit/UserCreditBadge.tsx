import React, { useEffect, useRef, useState } from "react"
import classnames from "classnames"

type UserCreditBadgeProps = {
  credit: number | undefined
}

const UserCreditBadge: React.FC<UserCreditBadgeProps> = ({ credit }) => {
  const [isHover, setIsHover] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditRef])

  return (
    <div
      className={classnames("user-credit-badge", {
        expandable,
        "user-credit-badge-warning": false, // gbReproduction < 1 && gbReproduction >= 0.1,
        "user-credit-badge-danger": false, // gbReproduction < 0.1,
      })}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <span className="credit-currency">USD</span>
      <span className="credit-value" style={{ width: `${currentWidth}px` }} ref={creditRef}>
        {fixedCredit}
      </span>
    </div>
  )
}

export default UserCreditBadge

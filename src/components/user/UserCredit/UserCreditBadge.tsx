/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import React, { useEffect, useState } from "react"
import classnames from "classnames"
import { getDecimalParts } from "@utils/math"
import { isTouchDevice } from "@utils/browser"

type UserCreditBadgeProps = {
  credit: number
}

const UserCreditBadge: React.FC<UserCreditBadgeProps> = ({ credit }) => {
  const [isHover, setIsHover] = useState(false)
  const [creditWidth, setCreditWidth] = useState(0)
  const [creditDecimalEl, setCreditDecimalEl] = useState<HTMLSpanElement>()

  const maxWidth = 40
  const expandable = creditWidth > maxWidth
  const isTouch = isTouchDevice()
  const currentDecimalWidth = !expandable || isHover ? creditWidth : maxWidth
  const { integer, decimal } = getDecimalParts(credit, 12)

  useEffect(() => {
    if (!creditDecimalEl) return

    setCreditWidth(creditDecimalEl.scrollWidth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditDecimalEl])

  return (
    <div
      className={classnames("user-credit-badge", {
        expandable,
        "user-credit-badge-warning": false, // gbReproduction < 1 && gbReproduction >= 0.1,
        "user-credit-badge-danger": false, // gbReproduction < 0.1,
      })}
      onMouseEnter={() => setIsHover(!isTouch)}
      onMouseLeave={() => setIsHover(false)}
    >
      <span className="user-credit-currency">USD</span>
      <div className="user-credit-value">
        <span className="user-credit-value-integer">
          {integer}.
        </span>
        <span
          className="user-credit-value-decimal"
          style={{ maxWidth: `${currentDecimalWidth}px` }}
          ref={el => el && setCreditDecimalEl(el)}
        >
          {decimal}
        </span>
      </div>
    </div>
  )
}

export default UserCreditBadge

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
import classNames from "classnames"

import { isTouchDevice } from "@/utils/browser"
import { getDecimalParts } from "@/utils/math"

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
      className={classNames(
        "relative flex h-9 cursor-pointer items-baseline overflow-hidden rounded-full px-4 py-1.5",
        "bg-gray-200/70 backdrop-blur dark:bg-gray-800/70",
        {
          "after:absolute after:inset-y-0 after:right-0 after:w-12 after:hover:opacity-0 after:md:content-none":
            expandable,
          "after:bg-gradient-to-r after:from-gray-100/10 after:via-gray-100/80 after:to-gray-100 ":
            expandable,
          "after:dark:from-gray-800/10 after:dark:via-gray-800/80 after:dark:to-gray-800":
            expandable,
        }
      )}
      onMouseEnter={() => setIsHover(!isTouch)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* <span className="hidden xs:inline text-xs tracking-tighter text-gray-600 dark:text-gray-400 mr-1">CHF</span> */}
      <div
        className={classNames(
          "relative flex items-baseline overflow-hidden",
          "text-gray-900 dark:text-gray-200"
        )}
      >
        <span className="text-xl font-semibold">{integer}.</span>
        <span
          className={classNames(
            "inline-block text-base font-medium opacity-60",
            "transition-[max-width] duration-300",
            "md:!max-w-[unset]"
          )}
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

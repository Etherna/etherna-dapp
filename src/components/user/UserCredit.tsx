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
import React, { useMemo } from "react"

import UserCreditBadge from "./UserCreditBadge"
import { Button } from "@/components/ui/actions"
import { Popup } from "@/components/ui/display"
import useSelector from "@/state/useSelector"
import { getDecimalParts } from "@/utils/math"
import { urlOrigin } from "@/utils/urls"

const UserCredit: React.FC = () => {
  const { creditUrl, bytePrice } = useSelector(state => state.env)
  const { credit, isSignedInGateway } = useSelector(state => state.user)

  const gbReproduction = useMemo(() => {
    if (credit == null || !bytePrice) return "0.000"
    return +((credit / bytePrice) * 0.000000001).toFixed(3)
  }, [credit, bytePrice])

  const readableCredit = useMemo(() => {
    const { integer, decimal } = getDecimalParts(credit ?? 0, 12)
    return `${integer}.${decimal}`
  }, [credit])

  if (!isSignedInGateway || credit == null) return null

  return (
    <div>
      <Popup toggle={<UserCreditBadge credit={credit} />} placement="bottom">
        <div className="min-w-xs p-4 text-center cursor-default">
          <p className="text-xs mb-4">You current balance is:</p>
          <p className="text-2xl font-bold break-all">
            {readableCredit}
            <span className="text-sm text-gray-600 dark:text-gray-400 tracking-tighter">CHF</span>
          </p>
          {bytePrice && (
            <p className="my-3 text-gray-600 dark:text-gray-400 text-sm">
              This is equivalent to <strong className="text-md">{gbReproduction}</strong> GB of
              videos reprodution.
            </p>
          )}
          <div className="mt-8 mb-4">
            <Button
              as="a"
              href={urlOrigin(creditUrl)! + "/manage/deposit"}
              rel="noreferrer noopener"
              target="_blank"
              color="muted"
            >
              Get more credit
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default UserCredit

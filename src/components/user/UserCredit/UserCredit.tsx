import React, { useEffect, useMemo, useRef, useState } from "react"
import classnames from "classnames"

import "./user-credit.scss"

import UserCreditBadge from "./UserCreditBadge"
import Button from "@common/Button"
import Popup from "@common/Popup"
import useSelector from "@state/useSelector"
import loginRedirect from "@state/actions/user/loginRedirect"

const UserCredit = () => {
  const { creditHost, bytePrice } = useSelector(state => state.env)
  const { credit, isSignedInGateway } = useSelector(state => state.user)

  const gbReproduction = useMemo(() => {
    if (!credit || !bytePrice || bytePrice === 0) return "0.000"
    return +(credit / bytePrice * 0.000000001).toFixed(3)
  }, [credit, bytePrice])

  return (
    <div className="user-credit-wrapper">
      <Popup
        toggle={
          <UserCreditBadge credit={credit} />
        }
        placement="bottom"
      >
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
                <a
                  href={creditHost}
                  className="btn btn-secondary"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Get more credit
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs mb-4">You are not signed in the gateway</div>
              <div className="mt-8 mb-4">
                <Button
                  size="small"
                  outline={true}
                  className="w-full"
                  action={() => loginRedirect("gateway")}
                >
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

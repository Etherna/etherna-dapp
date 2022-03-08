import React from "react"
import { Outlet } from "react-router-dom"

import SigninMessage from "@components/navigation/SigninMessage"
import useSelector from "@state/useSelector"

const SignedInRoute: React.FC = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const isSigningIn = isSignedIn === undefined
  const isFullySignedIn = isSignedIn === true

  return isSigningIn ? null : isFullySignedIn
    ? <Outlet />
    : <SigninMessage />
}

export default SignedInRoute

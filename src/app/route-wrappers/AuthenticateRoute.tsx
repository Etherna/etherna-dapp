import React from "react"
import { Outlet } from "react-router-dom"

import useAutoSignin from "@state/hooks/user/useAutoSignin"

const AuthenticateRoute: React.FC = () => {
  useAutoSignin()

  return <Outlet />
}

export default AuthenticateRoute

import React from "react"

import { providerActions } from "@state/actions"

type SigninButtonProps = {
  children: React.ReactNode
}

const SigninButton = ({ children }: SigninButtonProps) => {
  return (
    <button className="btn btn-outline" type="button" onClick={() => providerActions.signin(true)}>
      {children}
    </button>
  )
}

export default SigninButton

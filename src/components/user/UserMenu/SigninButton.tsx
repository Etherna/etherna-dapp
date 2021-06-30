import React from "react"

import Button from "@common/Button"
import loginRedirect from "@state/actions/user/loginRedirect"

const SigninButton: React.FC = ({ children }) => {
  return (
    <Button aspect="primary-light" type="button" action={() => loginRedirect()}>
      {children}
    </Button>
  )
}

export default SigninButton

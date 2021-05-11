import React from "react"

import loginRedirect from "@state/actions/user/loginRedirect"

const SigninButton: React.FC = ({ children }) => {
  return (
    <button className="btn btn-outline" type="button" onClick={() => loginRedirect()}>
      {children}
    </button>
  )
}

export default SigninButton

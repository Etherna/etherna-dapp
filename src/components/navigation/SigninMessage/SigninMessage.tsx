import React from "react"

import "./signin-message.scss"

import SigninButton from "@components/user/SigninButton"

const SigninMessage: React.FC = () => {
  return (
    <div className="signin-message">
      <div className="signin-message-text">
        You must signin to visit this page.
      </div>

      <div className="signin-message-action">
        <SigninButton>Sign in</SigninButton>
      </div>
    </div>
  )
}

export default SigninMessage

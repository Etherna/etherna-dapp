import React from "react"

import { providerActions } from "@state/actions"

const SigninButton = ({ children }) => {
    return (
        <button
            className="btn btn-outline"
            type="button"
            onClick={() => providerActions.signin(true)}
        >
            {children}
        </button>
    )
}

export default SigninButton

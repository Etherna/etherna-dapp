import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Dispatch } from "redux"
import classNames from "classnames"

import { ReactComponent as BackIcon } from "@svg/icons/back-icon.svg"

import useSelector from "@state/useSelector"
import Button from "@common/Button"
import { showError } from "@state/actions/modals"
import { UserActions, UserActionTypes } from "@state/reducers/userReducer"

type FairdriveExtensionPanelProps = {
  onBack?(): void
}

const FairdriveExtensionPanel: React.FC<FairdriveExtensionPanelProps> = ({ onBack }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch<Dispatch<UserActions>>()

  const { isSignedIn, isSignedInGateway, isSignedInFairdrive } = useSelector(state => state.user)
  const { fairosClient } = useSelector(state => state.env)

  const signin = async () => {
    try {
      await fairosClient.user.login(username, password)

      localStorage.setItem("fairdriveUsername", username)

      dispatch({
        type: UserActionTypes.USER_UPDATE_SIGNEDIN,
        isSignedIn: isSignedIn ?? false,
        isSignedInGateway: isSignedInGateway ?? false,
        isSignedInFairdrive: true
      })
    } catch (error) {
      showError("Cannot sign in", error.message)
    }
  }

  return (
    <div className="extension-panel">
      <div className="extension-panel-header">
        <Button aspect="transparent" size="small" action={onBack}>
          <BackIcon />
        </Button>
        <strong>Fairdrive</strong>
      </div>

      {!isSignedInFairdrive && (
        <>
          <small>Login into you fairdrive account</small>

          <div className="extension-panel-group">
            <strong className="flex-1">Username</strong>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="extension-panel-group">
            <strong className="flex-1">Password</strong>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <Button
            action={signin}
            size="small"
            className="mt-2 ml-auto"
            disabled={!username || !password}
          >
            Signin
          </Button>
        </>
      )}

      <hr />

      <div className="extension-panel-status-group">
        Status: {isSignedInFairdrive ? `Signed in` : `Signed out`}
        <span className={classNames("extension-panel-status", { active: isSignedInFairdrive })} />
      </div>
    </div>
  )
}

export default FairdriveExtensionPanel

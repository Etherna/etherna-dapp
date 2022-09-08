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

import React, { useCallback, useState } from "react"

import { ShieldCheckIcon } from "@heroicons/react/24/outline"

import { Button, Modal } from "@/components/ui/actions"
import { FormGroup } from "@/components/ui/display"
import { Alert } from "@/components/ui/display"
import { TextInput } from "@/components/ui/inputs"
import useBeeAuthentication from "@/state/hooks/ui/useBeeAuthentication"
import useSelector from "@/state/useSelector"

type BeeAuthModalProps = {
  show?: boolean
}

const BeeAuthModal: React.FC<BeeAuthModalProps> = ({ show = false }) => {
  const { gatewayUrl, beeClient } = useSelector(state => state.env)
  const { hideAuth } = useBeeAuthentication()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()

  const handleAuth = useCallback(async () => {
    setIsAuthenticating(true)
    try {
      await beeClient.authenticate(username, password)
      hideAuth(true)
    } catch (error: any) {
      console.error(error)
      const errorMessage = (error.response?.data || error.message || error).toString()
      setError(errorMessage)
    }
    setIsAuthenticating(false)
  }, [beeClient, hideAuth, password, username])

  return (
    <Modal
      show={show}
      showCloseButton={false}
      showCancelButton={false}
      status="success"
      title={`Authenticate with bee node '${gatewayUrl}'`}
      icon={<ShieldCheckIcon />}
      footerButtons={
        <>
          <Button
            loading={isAuthenticating}
            disabled={isAuthenticating || !password}
            onClick={() => handleAuth()}
          >
            Sign in
          </Button>
          <Button color="muted" onClick={() => hideAuth(false)} disabled={isAuthenticating}>
            Cancel
          </Button>
        </>
      }
    >
      <FormGroup>
        <TextInput value={username} type="text" onChange={setUsername} onEnter={handleAuth} />
      </FormGroup>
      <FormGroup>
        <TextInput value={password} type="password" onChange={setPassword} onEnter={handleAuth} />
      </FormGroup>
      {error && (
        <FormGroup>
          <Alert title="Authentication error" color="error" onClose={() => setError(undefined)}>
            {error}
          </Alert>
        </FormGroup>
      )}
    </Modal>
  )
}

export default BeeAuthModal

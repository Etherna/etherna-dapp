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
import React, { useCallback } from "react"
import { AuthProvider } from "react-oidc-context"
import { Outlet, useNavigate } from "react-router-dom"
import { WebStorageStateStore } from "oidc-client-ts"

import type { User } from "oidc-client-ts"

const IdentityRoute: React.FC = () => {
  const navigate = useNavigate()

  const onSigninCallback = useCallback(
    (user: User | void) => {
      navigate("/")
    },
    [navigate]
  )

  return (
    <AuthProvider
      authority={import.meta.env.VITE_APP_SSO_URL}
      client_id={"ethernaDappClientId"}
      redirect_uri={window.location.origin + "/callback"}
      automaticSilentRenew={true}
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={onSigninCallback}
    >
      <Outlet />
    </AuthProvider>
  )
}

export default IdentityRoute

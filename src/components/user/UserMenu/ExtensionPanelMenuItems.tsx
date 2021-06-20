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

import React from "react"

import ExtensionPanel from "./ExtensionPanel"
import { enviromentActions } from "@state/actions"
import useSelector from "@state/useSelector"

export type PanelType = "index" | "gateway"

type EnvDropDownMenusProps = {
  panel: PanelType
  onBack(): void
}

const ExtensionPanelMenuItems: React.FC<EnvDropDownMenusProps> = ({ panel, onBack }) => {
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)
  const {
    indexHost,
    indexApiPath,
    gatewayHost,
    gatewayApiPath,
    indexClient,
    gatewayClient
  } = useSelector(state => state.env)

  const handleIndexUpdate = (host: string, apiPath: string) => {
    enviromentActions.updateIndexHost(host, apiPath)
    window.location.reload()
  }

  const handleIndexReset = () => {
    enviromentActions.resetIndexHost()
    window.location.reload()
  }

  const handleGatewayUpdate = (host: string, apiPath: string) => {
    enviromentActions.updateGatewayHost(host, apiPath)
    window.location.reload()
  }

  const handleGatewayReset = () => {
    enviromentActions.resetGatewayHost()
    window.location.reload()
  }

  return (
    <>
      {panel === "index" && (
        <ExtensionPanel
          title="Etherna Index"
          description={"You can change the default Etherna Index here"}
          host={indexHost}
          apiPath={indexApiPath}
          defaultHost={import.meta.env.VITE_APP_INDEX_HOST}
          defaultApiPath={import.meta.env.VITE_APP_INDEX_API_PATH}
          isSignedIn={isSignedIn}
          onReset={handleIndexReset}
          onSave={handleIndexUpdate}
          onSignin={() => indexClient.loginRedirect()}
          onSignout={() => indexClient.logoutRedirect()}
          onBack={onBack}
        />
      )}

      {panel === "gateway" && (
        <ExtensionPanel
          title="Swarm Gateway"
          description={"Here you can specify a different Swarm Gateway"}
          host={gatewayHost}
          apiPath={gatewayApiPath}
          defaultHost={import.meta.env.VITE_APP_GATEWAY_HOST}
          defaultApiPath={import.meta.env.VITE_APP_GATEWAY_API_PATH}
          isSignedIn={isSignedInGateway}
          onReset={handleGatewayReset}
          onSave={handleGatewayUpdate}
          onSignin={() => gatewayClient.loginRedirect()}
          onSignout={() => gatewayClient.logoutRedirect()}
          onBack={onBack}
        />
      )}
    </>
  )
}

export default ExtensionPanelMenuItems

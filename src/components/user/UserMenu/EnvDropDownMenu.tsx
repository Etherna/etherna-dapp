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

import EnvExtensionPanel from "./EnvExtensionPanel"
import { DropDownMenu } from "@common/DropDown"
import { enviromentActions } from "@state/actions"
import useSelector from "@state/useSelector"

type EnvDropDownMenusProps = {
  indexMenuRef: React.RefObject<HTMLDivElement>
  gatewayMenuRef: React.RefObject<HTMLDivElement>
}

const EnvDropDownMenus = ({ indexMenuRef, gatewayMenuRef }: EnvDropDownMenusProps) => {
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
      <DropDownMenu title="Etherna Index" menuRef={indexMenuRef} alignRight={true}>
        <EnvExtensionPanel
          description={"You can change the default Etherna Index here"}
          host={indexHost}
          apiPath={indexApiPath}
          defaultHost={process.env.REACT_APP_INDEX_HOST}
          defaultApiPath={process.env.REACT_APP_INDEX_API_PATH}
          isSignedIn={isSignedIn}
          onReset={handleIndexReset}
          onSave={handleIndexUpdate}
          onSignin={() => indexClient.loginRedirect()}
          onSignout={() => indexClient.logoutRedirect()}
        />
      </DropDownMenu>

      <DropDownMenu title="Swarm Gateway" menuRef={gatewayMenuRef} alignRight={true}>
        <EnvExtensionPanel
          description={"Here you can specify a different Swarm Gateway"}
          host={gatewayHost}
          apiPath={gatewayApiPath}
          defaultHost={process.env.REACT_APP_GATEWAY_HOST}
          defaultApiPath={process.env.REACT_APP_GATEWAY_API_PATH}
          isSignedIn={isSignedInGateway}
          onReset={handleGatewayReset}
          onSave={handleGatewayUpdate}
          onSignin={() => gatewayClient.loginRedirect()}
          onSignout={() => gatewayClient.logoutRedirect()}
        />
      </DropDownMenu>
    </>
  )
}

export default EnvDropDownMenus

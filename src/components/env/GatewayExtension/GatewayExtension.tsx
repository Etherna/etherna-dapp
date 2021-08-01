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

import { ReactComponent as GatewayIcon } from "@svg/icons/navigation/gateway.svg"

import ExtensionHostStatus from "@components/env/ExtensionHostStatus"
import useSelector from "@state/useSelector"
import useExtensionEditor from "@state/hooks/ui/useExtensionEditor"

type GatewayExtensionProps = {
  noIcon?: boolean
  compactMobile?: boolean
}

const GatewayExtension: React.FC<GatewayExtensionProps> = ({ noIcon = false, compactMobile = false }) => {
  const { gatewayUrl } = useSelector(state => state.env)
  const { isSignedInGateway } = useSelector(state => state.user)

  const { showEditor } = useExtensionEditor()

  return (
    <ExtensionHostStatus
      title="Gateway"
      host={gatewayUrl}
      isConnected={isSignedInGateway}
      iconSvg={!noIcon && <GatewayIcon />}
      onClick={() => showEditor("gateway", gatewayUrl)}
      compactMobile={compactMobile}
    />
  )
}

export default GatewayExtension

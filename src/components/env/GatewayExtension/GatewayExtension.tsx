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

import React from "react"

import { ReactComponent as IndexIcon } from "@svg/icons/navigation/index.svg"

import ExtensionHostStatus from "@components/env/ExtensionHostStatus"
import useSelector from "@state/useSelector"
import useExtensionEditor from "@state/hooks/ui/useExtensionEditor"

type IndexExtensionProps = {
  noIcon?: boolean
}

const IndexExtension: React.FC<IndexExtensionProps> = ({ noIcon = false }) => {
  const { indexUrl } = useSelector(state => state.env)
  const { isSignedIn } = useSelector(state => state.user)

  const { showEditor } = useExtensionEditor()

  return (
    <ExtensionHostStatus
      title="Index"
      host={indexUrl}
      isConnected={isSignedIn}
      iconSvg={!noIcon && <IndexIcon />}
      onClick={() => showEditor("index", indexUrl)}
    />
  )
}

export default IndexExtension

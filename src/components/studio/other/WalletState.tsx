import React, { useMemo } from "react"

import Alert from "@common/Alert"

type WalletStateProps = {
  isLocked?: boolean
  selectedAddress?: string
  profileAddress: string
}

const WalletState: React.FC<WalletStateProps> = ({
  isLocked,
  selectedAddress,
  profileAddress,
}) => {
  const sameAddress = useMemo(() => {
    if (!selectedAddress) return false
    return selectedAddress.toLowerCase() === profileAddress.toLowerCase()
  }, [selectedAddress, profileAddress])

  return (
    <>
      {isLocked && (
        <Alert title="Wallet Locked" type="warning">
          Please unlock your wallet before saving.
        </Alert>
      )}
      {(selectedAddress && !sameAddress) && (
        <Alert title="Wrong Account" type="warning">
          Please switch to the account <pre><strong>{profileAddress}</strong></pre> before saving.
        </Alert>
      )}
    </>
  )
}

export default WalletState

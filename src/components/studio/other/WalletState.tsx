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

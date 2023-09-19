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

import { Button } from "@/components/ui/actions"
import { Alert } from "@/components/ui/display"
import useWallet from "@/hooks/useWallet"
import useUserStore from "@/stores/user"

type WalletStateProps = {}

const WalletState: React.FC<WalletStateProps> = () => {
  const address = useUserStore(state => state.address)
  const { isLocked, selectedAddress, unlockWallet, switchAccount } = useWallet()

  const sameAddress = useMemo(() => {
    if (!selectedAddress) return false
    return selectedAddress.toLowerCase() === address?.toLowerCase()
  }, [selectedAddress, address])

  return (
    <>
      {isLocked && (
        <Alert title="Unlock your wallet to continue" color="info">
          <Button className="mt-3" onClick={unlockWallet}>
            Unlock
          </Button>
        </Alert>
      )}
      {selectedAddress && !sameAddress && (
        <Alert title="Wrong Account" color="warning">
          Please switch to the account{" "}
          <pre>
            <strong>{address}</strong>
          </pre>{" "}
          before saving.
          <br />
          <Button className="mt-3" onClick={() => switchAccount(address!)}>
            Switch
          </Button>
        </Alert>
      )}
    </>
  )
}

export default WalletState

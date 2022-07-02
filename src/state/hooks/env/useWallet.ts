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
 */

import { useEffect, useState } from "react"

import useSelector from "@/state/useSelector"
import { checkWalletLocked, fetchAccounts } from "@/utils/ethereum"

export default function useWallet() {
  const { currentWallet } = useSelector(state => state.env)

  const [isLocked, setIsLocked] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()

  useEffect(() => {
    if (currentWallet === "metamask") {
      setIsLocked(checkWalletLocked())
      setSelectedAddress(window.ethereum?.selectedAddress)

      window.ethereum?.on?.("accountsChanged", onAccountsChanged)
    } else {
      setIsLocked(false)
    }

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged)
    }
  }, [currentWallet])

  const onAccountsChanged = (accounts: string[]) => {
    setIsLocked(accounts.length === 0)
    setSelectedAddress(accounts[0])
  }

  const unlockWallet = async () => {
    const accounts = await fetchAccounts() as string[]
    setSelectedAddress(accounts[0])
  }

  return {
    isLocked,
    selectedAddress,
    unlockWallet,
  }
}

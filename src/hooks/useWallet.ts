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
import { useCallback, useEffect, useState } from "react"

import useUserStore from "@/stores/user"
import { checkWalletLocked, fetchAccounts, switchAccount as switchTo } from "@/utils/ethereum"

export default function useWallet() {
  const currentWallet = useUserStore(state => state.currentWallet)

  const [isLocked, setIsLocked] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()

  useEffect(() => {
    const onAccountsChanged = (accounts: string[]) => {
      setIsLocked(accounts.length === 0)
      setSelectedAddress(accounts[0])
    }

    const onConnect = () => {
      //console.log("CONNECTED", window.ethereum?.selectedAddress)
    }

    const onDisconnect = () => {
      //console.log("DISCONNECTED")
    }

    if (currentWallet === "metamask") {
      setIsLocked(checkWalletLocked())
      setSelectedAddress(window.ethereum?.selectedAddress)

      window.ethereum?.on?.("accountsChanged", onAccountsChanged)
      window.ethereum?.on?.("connect", onConnect)
      window.ethereum?.on?.("disconnect", onDisconnect)
    } else {
      setIsLocked(false)
    }

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged)
      window.ethereum?.removeListener?.("connect", onConnect)
      window.ethereum?.removeListener?.("disconnect", onDisconnect)
    }
  }, [currentWallet])

  const unlockWallet = useCallback(async () => {
    try {
      const accounts = (await fetchAccounts()) as string[]
      setSelectedAddress(accounts[0])
      setIsLocked(false)
    } catch (error: any) {
      if (error.code === -32002) {
        alert("Already proccesing an unlock request. Manually unlock your wallet.")
      }
    }
  }, [])

  const switchAccount = useCallback(
    async (address: string) => {
      try {
        await switchTo(address)
        await unlockWallet()
      } catch (error: any) {
        if (error.code === -32002) {
          alert("Already proccesing an switch request. Manually switch account.")
        }
      }
    },
    [unlockWallet]
  )

  return {
    isLocked,
    selectedAddress,
    unlockWallet,
    switchAccount,
  }
}

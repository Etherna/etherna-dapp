import { useQuery } from "@tanstack/react-query"

import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

interface UseProfilePreviewOptions {
  address: EthAddress | EnsAddress | null | undefined
}

export const useProfilePreviewQuery = (opts: UseProfilePreviewOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: useProfilePreviewQuery.getQueryKey(opts.address),
    queryFn: async () => {
      if (!opts.address) {
        throw new Error("Address is required")
      }

      const reader = new SwarmProfile.Reader(opts.address, {
        beeClient,
      })

      const profile = await reader.download({
        mode: "preview",
      })

      if (!profile) {
        throw new Error("Profile not found: " + opts.address)
      }

      return profile.preview
    },
    enabled: !!opts.address,
  })
}
useProfilePreviewQuery.getQueryKey = (address: EthAddress | EnsAddress | null | undefined) => [
  "profile-preview",
  address,
]

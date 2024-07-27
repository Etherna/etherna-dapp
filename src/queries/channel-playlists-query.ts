import { useQuery } from "@tanstack/react-query"

import SwarmProfile from "@/classes/SwarmProfile"
import useClientsStore from "@/stores/clients"

import type { EthAddress } from "@etherna/sdk-js/clients"

interface ChannelPlaylistOptions {
  owner: EthAddress | null | undefined
}

export function useChannelPlaylistsQuery({ owner }: ChannelPlaylistOptions) {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: useChannelPlaylistsQuery.getQueryKey(owner!),
    queryFn: async () => {
      if (!owner || owner === "0x0") return []

      const reader = new SwarmProfile.Reader(owner, {
        beeClient,
      })

      const profile = await reader.download({ mode: "full" })
      return profile?.details?.playlists ?? []
    },
    enabled: !!owner,
  })
}
useChannelPlaylistsQuery.getQueryKey = (owner: EthAddress) => ["channel-playlists", owner]

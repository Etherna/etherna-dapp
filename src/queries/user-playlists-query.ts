import { UserPlaylistsReader } from "@etherna/sdk-js/swarm"
import { useQuery } from "@tanstack/react-query"

import useClientsStore from "@/stores/clients"

import type { EthAddress } from "@etherna/sdk-js/clients"

interface ChannelPlaylistOptions {
  owner: EthAddress | null | undefined
}

export function useUserPlaylistsQuery({ owner }: ChannelPlaylistOptions) {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: useUserPlaylistsQuery.getQueryKey(owner!),
    queryFn: async () => {
      if (!owner || owner === "0x0") return []

      const reader = new UserPlaylistsReader(owner, {
        beeClient,
      })

      try {
        const playlistsReferences = await reader.download()
        return playlistsReferences
      } catch (error) {
        return []
      }
    },
    enabled: !!owner,
  })
}
useUserPlaylistsQuery.getQueryKey = (owner: EthAddress) => ["user-playlists", owner]

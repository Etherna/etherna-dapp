import { useQuery } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EnsAddress, EthAddress, Reference } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"

interface UsePlaylistOptions {
  owner?: EthAddress | EnsAddress
  playlistIdentification: PlaylistIdentification
  enabled?: boolean
}

export const usePlaylistQuery = (opts: UsePlaylistOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: usePlaylistQuery.getQueryKey(opts.owner, opts.playlistIdentification),
    queryFn: async () => {
      const reader = new SwarmPlaylist.Reader(opts.playlistIdentification, {
        beeClient,
      })

      const playlist = await reader.download({
        mode: "full",
      })

      return playlist
    },
    enabled: opts.enabled,
  })
}
usePlaylistQuery.getQueryKey = (
  owner: EthAddress | EnsAddress | undefined,
  identification: PlaylistIdentification
) =>
  [
    "playlist",
    owner,
    "id" in identification ? identification.id : identification.rootManifest,
  ].filter(Boolean)

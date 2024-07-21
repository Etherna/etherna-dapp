import { useQuery } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"
import type { UseQueryOptions } from "@tanstack/react-query"

interface UsePlaylistOptions {
  owner?: EthAddress | EnsAddress
  playlistIdentification: PlaylistIdentification
  enabled?: boolean
}

export const usePlaylistQuery = (opts: UsePlaylistOptions) => {
  return useQuery(usePlaylistQuery.getQueryConfig(opts))
}
usePlaylistQuery.getQueryConfig = (opts: UsePlaylistOptions) =>
  ({
    queryKey: usePlaylistQuery.getQueryKey(opts.playlistIdentification),
    queryFn: async () => {
      const beeClient = useClientsStore.getState().beeClient
      const reader = new SwarmPlaylist.Reader(opts.playlistIdentification, {
        beeClient,
      })

      const playlist = await reader.download({
        mode: "full",
      })

      return playlist
    },
    enabled: opts.enabled,
  }) satisfies UseQueryOptions
usePlaylistQuery.getQueryKey = (identification: PlaylistIdentification) =>
  [
    "playlist",
    "id" in identification ? identification.id : identification.rootManifest,
    "id" in identification ? identification.owner : null,
  ].filter(Boolean)

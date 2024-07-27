import { useQuery } from "@tanstack/react-query"

import SwarmPlaylist from "@/classes/SwarmPlaylist"
import useClientsStore from "@/stores/clients"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"
import type { PlaylistIdentification } from "@etherna/sdk-js/swarm"

interface UsePlaylistPreviewOptions {
  owner: EthAddress | EnsAddress
  playlistIdentification: PlaylistIdentification
  enabled?: boolean
}

export const usePlaylistPreviewQuery = (opts: UsePlaylistPreviewOptions) => {
  const beeClient = useClientsStore(state => state.beeClient)

  return useQuery({
    queryKey: usePlaylistPreviewQuery.getQueryKey(opts.owner, opts.playlistIdentification),
    queryFn: async () => {
      const reader = new SwarmPlaylist.Reader(opts.playlistIdentification, {
        beeClient,
      })

      const playlist = await reader.download({
        mode: "preview",
      })

      return playlist.preview
    },
    enabled: opts.enabled,
  })
}
usePlaylistPreviewQuery.getQueryKey = (
  owner: EthAddress | EnsAddress,
  identification: PlaylistIdentification
) => [
  "playlist-preview",
  owner,
  "id" in identification ? identification.id : identification.rootManifest,
]

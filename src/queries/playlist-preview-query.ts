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

  const id =
    "id" in opts.playlistIdentification
      ? opts.playlistIdentification.id
      : opts.playlistIdentification.rootManifest

  return useQuery({
    queryKey: ["playlist-preview", opts.owner, id],
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

import type { Profile } from "@definitions/swarm-profile"

export type SwarmProfileReaderOptions = {
  beeClient: SwarmBeeClient
  fetchFromCache?: boolean
  updateCache?: boolean
}

export type SwarmProfileWriterOptions = {
  beeClient: SwarmBeeClient
}

// @ts-check
import { createPostageBatch } from "./create-postage-batch.mjs"
import { loadSeed } from "./swarm-seed.mjs"

const batchId = await createPostageBatch()
await loadSeed(batchId)

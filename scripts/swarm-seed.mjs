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

import { Bee } from "@ethersphere/bee-js"
import chalk from "chalk"
import DotEnv from "dotenv"
import fs from "fs"
import path from "path"

DotEnv.config({
  path: fs.existsSync(path.resolve(".env.development")) ? ".env.development" : ".env",
})

const SeedDataFolder = path.resolve("seed")
const bee = new Bee(new URL(process.env.VITE_APP_GATEWAY_URL).origin)

export async function testSeed() {
  const batchId = "b84f43bd8f1e1f53a2c777546a03872df6537e4e9f1aff4a43bc983b93628fc7"

  try {
    const resp = await bee.uploadFile(batchId, JSON.stringify({ test: "Ciao" }))
    console.log("reference", resp.reference)
    const topic = bee.makeFeedTopic("Test")
    const feed = bee.makeFeedWriter(
      "sequence",
      topic,
      "f7622a4bd4375046bbc9712e00ecebdf9460a1212b72c585c4096c3bc80f7634"
    )
    const updateReference = await feed.upload(batchId, resp.reference)
    const feedManifest = await bee.createFeedManifest(
      batchId,
      "sequence",
      topic,
      "0xa6Ac1c7b69Ae39Ba85e803F6A3639c90D774B414"
    )

    console.log("feed update", updateReference)
    console.log("feed manifest", feedManifest)

    const video = fs.readFileSync(path.resolve("/Users/mattia/Public/webm-h264 (480p).mp4"))
    const videoResp = await bee.uploadFile(batchId, new Uint8Array(video), undefined, {
      contentType: "video/mp4",
    })
    console.log("video reference", videoResp.reference)
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`))
  }
}

export async function loadSeed(batchId) {
  if (process.env.BEE_SEED_ENABLED !== "true") return

  const requests = fs.existsSync(SeedDataFolder + "/requests.json")
    ? JSON.parse(fs.readFileSync(SeedDataFolder + "/requests.json").toString())
    : { v: 1, items: [] }

  if (!requests.items.length) return

  console.log(chalk.blueBright(`Loading seed data...`))

  let loadedItems = 0
  let unloadedItems = 0

  for (const item of requests.items) {
    const url = `${process.env.BEE_ENDPOINT}${item.path}${item.search}`
    const body = item.dataId ? fs.readFileSync(SeedDataFolder + "/data/" + item.dataId) : undefined
    const resp = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "swarm-postage-batch-id": batchId,
        "Content-Type": item.contentType,
      },
    })
    if (resp.ok) {
      loadedItems++
    } else {
      console.log(await resp.json())
      unloadedItems++
    }
  }

  console.log(chalk.blueBright(`Seed complete. Loaded ${loadedItems} items.`))
  if (unloadedItems > 0) {
    console.log(chalk.redBright(`${unloadedItems} items were not loaded correctly.`))
  }
}

if (process.argv[1].endsWith(path.basename(import.meta.url))) {
  testSeed()
}

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

import chalk from "chalk"
import DotEnv from "dotenv"
import fs from "fs"
import path from "path"

DotEnv.config({
  path: fs.existsSync(path.resolve(".env.development")) ? ".env.development" : ".env",
})

const SeedDataFolder = path.resolve("seed")

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

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

/* eslint-disable no-restricted-imports */

import fs from "fs"
import type { IncomingMessage } from "http"
import type { Response } from "node-fetch"
import path from "path"

import parseJSON from "../utils/parse-json.js"

const SeedDataFolder = path.resolve(process.cwd() + "/../") + "/seed"

/**
 * Save seed data locally
 *
 * @param req Incoming request
 * @param body Incoming request parsed body
 * @param res Proxy response
 */
export default async function saveSeedData(
  req: IncomingMessage,
  body: Buffer | undefined,
  res: Response
) {
  const shouldSaveSeedData = process.env.BEE_SEED_ENABLED === "true"

  // Check if request is seedable
  if (!shouldSaveSeedData) return
  if (req.method !== "POST") return
  if (!/^\/(soc|bzz|feeds)/.test(req.url)) return

  // create folders
  if (!fs.existsSync(SeedDataFolder)) fs.mkdirSync(SeedDataFolder)
  if (!fs.existsSync(SeedDataFolder + "/data")) fs.mkdirSync(SeedDataFolder + "/data")

  const data = await res.clone().arrayBuffer()
  const respJson = parseJSON<{ reference?: string }>(Buffer.from(data).toString())
  const reference = respJson.reference

  if (!reference) return

  type RequestsLog = {
    v: number
    items: Array<{
      path: string
      search?: string
      contentType: string | null
      dataId?: string
    }>
  }

  const requests: RequestsLog = fs.existsSync(SeedDataFolder + "/requests.json")
    ? JSON.parse(fs.readFileSync(SeedDataFolder + "/requests.json").toString())
    : { v: 1, items: [] }

  const dataId = Buffer.isBuffer(body) ? reference : undefined
  const exists = requests.items.find(item => item.path === req.url! && item.dataId === dataId)
  const url = new URL(req.url, "http://dummy.test")

  if (!exists) {
    requests.items.push({
      path: url.pathname,
      search: url.search,
      contentType: req.headers["content-type"] || null,
      dataId,
    })

    fs.writeFileSync(SeedDataFolder + "/requests.json", JSON.stringify(requests))
    if (Buffer.isBuffer(body)) {
      fs.writeFileSync(SeedDataFolder + "/data/" + reference, body)
    }
  }
}

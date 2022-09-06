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

import SwarmResourcesIO from "."
import type { SwarmResourcesReaderOptions, SwarmResourceStatus } from "./types"
import type EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import type { Video } from "@/definitions/swarm-video"

/**
 * Load swarm resources info from gateway
 */
export default class SwarmResourcesReader {
  video: Video
  resourcesStatus?: SwarmResourceStatus[]

  private gatewayClient: EthernaGatewayClient

  constructor(video: Video, opts: SwarmResourcesReaderOptions) {
    this.video = video
    this.gatewayClient = opts.gatewayClient
  }

  async download() {
    const references = SwarmResourcesIO.getVideoReferences(this.video)
    const responses = await Promise.allSettled(
      references.map(reference => this.gatewayClient.resources.fetchOffers(reference))
    )

    this.resourcesStatus = []

    for (const [index, reference] of references.entries()) {
      const response = responses[index]
      this.resourcesStatus.push({
        reference,
        isOffered: response.status === "fulfilled" && response.value.length > 0,
        offeredBy: response.status === "fulfilled" ? response.value : [],
      })
    }
  }

  getReferenceStatus(reference: string): SwarmResourceStatus | null {
    return this.resourcesStatus?.find(status => status.reference === reference) ?? null
  }
}

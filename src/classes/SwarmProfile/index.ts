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

import SwarmProfileReader from "./SwarmProfileReader"
import SwarmProfileWriter from "./SwarmProfileWriter"
import type { SchemaVersion } from "@/definitions/schema"
import type { Profile } from "@/definitions/swarm-profile"

const lastVersion: SchemaVersion = "1.0"

const SwarmProfileIO = {
  Reader: SwarmProfileReader,
  Writer: SwarmProfileWriter,
  lastVersion,
  getFeedTopicName: () => `EthernaUserProfile`,
  getDefaultProfile(address: string): Profile {
    return {
      address,
      name: "",
      description: "",
      avatar: null,
      cover: null,
      v: SwarmProfileIO.lastVersion,
    }
  },
}

export default SwarmProfileIO

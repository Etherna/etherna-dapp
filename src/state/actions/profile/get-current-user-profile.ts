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

import type { Profile } from "@/definitions/swarm-profile"
import { store } from "@/state/store"

/**
 * Get current user profile
 *
 * @returns Current profile info
 */
const getCurrentUserProfile = (): Profile => {
  const { name, description, avatar, cover } = store.getState().profile
  const { address } = store.getState().user
  return {
    address: address ?? "0x",
    name: name ?? "",
    description: description ?? "",
    avatar: avatar ?? null,
    cover: cover ?? null,
  }
}

export default getCurrentUserProfile

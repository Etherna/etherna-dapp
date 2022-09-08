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

import { createContext } from "react"

import type { IndexExtensionHost } from "@/definitions/extension-host"
import type {
  VideoEditorContextStore,
  PublishSource,
  PublishSourceSave,
} from "@/definitions/video-editor-context"
import { parseLocalStorage } from "@/utils/local-storage"
import { urlHostname } from "@/utils/urls"

export const VideoEditorContext = createContext<VideoEditorContextStore | undefined>(undefined)

export const getAllSources = () => {
  const indexes = parseLocalStorage<IndexExtensionHost[]>("setting:index-hosts") ?? [
    {
      name: "Etherna Index",
      url: import.meta.env.VITE_APP_INDEX_URL,
    },
  ]

  const sources: PublishSource[] = [
    {
      source: "playlist",
      name: "Public channel",
      description: "Decentralized feed",
      identifier: "__channel",
      videoId: undefined,
    },
    ...indexes.map(host => ({
      source: "index" as "index",
      name: host.name,
      description: urlHostname(host.url) ?? "",
      identifier: host.url,
      videoId: undefined,
    })),
  ]

  return sources
}

export const getDefaultAddTo = () => {
  return getAllSources().map(
    source =>
      ({
        source: source.source,
        identifier: source.identifier,
        add: true,
      } as PublishSourceSave)
  )
}

// forward exports
export { default as VideoEditorContextProvider } from "./VideoEditorContextProvider"
export { VideoEditorActionTypes } from "./reducer"
export type { AnyVideoEditorAction } from "./reducer"
export type {
  VideoEditorContextStore,
  VideoEditorContextState,
  VideoEditorQueue,
} from "@/definitions/video-editor-context"

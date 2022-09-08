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

import SwarmImageIO from "."
import type { SwarmImageReaderOptions } from "./types"
import type { SwarmImageRaw, SwarmImage } from "@/definitions/swarm-image"
import { blurHashToDataURL } from "@/utils/blur-hash"

/**
 * Load an image data from swarm and parse image object
 */
export default class SwarmImageReader {
  imageRaw: SwarmImageRaw
  image: SwarmImage

  constructor(image: SwarmImageRaw | SwarmImage, opts: SwarmImageReaderOptions) {
    const sources = Object.entries(image.sources)
      .map(([size, reference]) => ({
        size,
        reference,
      }))
      .sort((a, b) => parseInt(b.size) - parseInt(a.size))

    if ("src" in image) {
      this.image = image
      this.imageRaw = {
        aspectRatio: image.aspectRatio,
        blurhash: image.blurhash,
        sources: image.sources,
        v: SwarmImageIO.lastVersion,
      }
    } else {
      this.imageRaw = image
      this.image = {
        ...image,
        blurredBase64: blurHashToDataURL(image.blurhash),
        src: opts.beeClient.getBzzUrl(sources[0].reference),
        srcset:
          sources.length > 1
            ? sources.reduce(
                (srcset, source) =>
                  `${srcset ? srcset + "," : ""} ${source.size} ${opts.beeClient.getBzzUrl(
                    source.reference
                  )}`,
                ""
              )
            : undefined,
        v: SwarmImageIO.lastVersion,
      }
    }
  }

  static getOriginalSourceReference(
    image: SwarmImage | SwarmImageRaw | null | undefined
  ): string | undefined {
    const source = Object.entries(image?.sources ?? {}).sort(
      (a, b) => parseInt(b[0]) - parseInt(a[0])
    )[0]
    return source?.[1] ?? undefined
  }
}

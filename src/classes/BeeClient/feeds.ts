import { utils } from "@noble/secp256k1"
import type { AxiosError, AxiosResponseHeaders } from "axios"

import type BeeClient from "."
import type {
  Epoch,
  EthAddress,
  FeedInfo,
  FeedUpdateHeaders,
  FeedUpdateOptions,
  FeedUploadOptions,
  Index,
  ReferenceResponse,
} from "./types"
import { makeBytes, serializeBytes } from "./utils/bytes"
import { keccak256Hash } from "./utils/hash"
import { extractUploadHeaders } from "./utils/headers"
import { makeHexString } from "./utils/hex"
import { makeBytesReference } from "./utils/reference"
import { writeUint64BigEndian } from "./utils/uint64"

const feedEndpoint = "/feeds"

export default class Feed {
  constructor(private instance: BeeClient) {}

  makeFeed(
    topicName: string,
    owner: EthAddress,
    type: "sequence" | "epoch" = "sequence"
  ): FeedInfo {
    return {
      topic: utils.bytesToHex(keccak256Hash(topicName)),
      owner: makeHexString(owner),
      type,
    }
  }

  makeReader(feed: FeedInfo) {
    const instance = this.instance
    return {
      ...feed,
      async download(options?: FeedUpdateOptions) {
        if (options?.at) {
          throw new Error("Not implemented yet")
        }
        if (options?.index) {
          throw new Error("Not implemented yet")
        }

        const { data } = await instance.request.get<ReferenceResponse>(
          `${feedEndpoint}/${feed.owner}/${feed.topic}`,
          {
            params: {
              type: feed.type,
            },
            headers: options?.headers,
            signal: options?.signal,
            timeout: options?.timeout,
          }
        )

        return {
          reference: data.reference,
        }
      },
    }
  }

  makeWriter(feed: FeedInfo) {
    if (!this.instance.signer) {
      throw new Error("No signer provided")
    }

    if (makeHexString(this.instance.signer.address) !== feed.owner) {
      throw new Error("Signer address does not match feed owner")
    }

    const upload = async (reference: string, options: FeedUploadOptions) => {
      const canonicalReference = makeBytesReference(reference)

      const nextIndex =
        !options.index || options.index === "latest"
          ? await this.findNextIndex(feed)
          : options.index

      const identifier = this.makeFeedIdentifier(feed.topic, nextIndex)
      const at = options.at ?? Date.now() / 1000.0
      const timestamp = writeUint64BigEndian(at)
      const payloadBytes = serializeBytes(timestamp, canonicalReference)

      return await this.instance.soc.upload(identifier, payloadBytes, options)
    }

    return {
      upload,
    }
  }

  async createRootManifest(feed: FeedInfo, options: FeedUploadOptions) {
    const response = await this.instance.request.post<ReferenceResponse>(
      `${feedEndpoint}/${feed.owner}/${feed.topic}`,
      null,
      {
        params: {
          type: feed.type,
        },
        headers: extractUploadHeaders(options),
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )

    return response.data.reference
  }

  makeRootManifest(feed: FeedInfo) {
    throw new Error("Not implemented yet")
  }

  // Utils
  async fetchLatestFeedUpdate(feed: FeedInfo) {
    const resp = await this.instance.request.get<ReferenceResponse>(
      `${feedEndpoint}/${feed.owner}/${feed.topic}`,
      {
        params: {
          type: feed.type,
        },
      }
    )

    return {
      reference: resp.data.reference,
      ...this.readFeedUpdateHeaders(resp.headers),
    }
  }

  async findNextIndex(feed: FeedInfo) {
    try {
      const feedUpdate = await this.fetchLatestFeedUpdate(feed)

      return makeHexString(feedUpdate.feedIndexNext)
    } catch (e: any) {
      const error = e as AxiosError

      if (error.response?.status === 404) {
        return utils.bytesToHex(makeBytes(8))
      }
      throw e
    }
  }

  private readFeedUpdateHeaders(headers: AxiosResponseHeaders): FeedUpdateHeaders {
    const feedIndex = headers["swarm-feed-index"]
    const feedIndexNext = headers["swarm-feed-index-next"]

    if (!feedIndex) {
      throw new Error("Response did not contain expected swarm-feed-index!")
    }

    if (!feedIndexNext) {
      throw new Error("Response did not contain expected swarm-feed-index-next!")
    }

    return {
      feedIndex,
      feedIndexNext,
    }
  }

  private makeFeedIdentifier(topic: string, index: Index): Uint8Array {
    if (typeof index === "number") {
      return this.makeSequentialFeedIdentifier(topic, index)
    } else if (typeof index === "string") {
      const indexBytes = this.makeFeedIndexBytes(index)

      return this.hashFeedIdentifier(topic, indexBytes)
    } else if (this.isEpoch(index)) {
      throw new TypeError("epoch is not yet implemented")
    }

    return this.hashFeedIdentifier(topic, index)
  }

  private isEpoch(epoch: unknown): epoch is Epoch {
    return typeof epoch === "object" && epoch !== null && "time" in epoch && "level" in epoch
  }

  private hashFeedIdentifier(topic: string, index: Uint8Array): Uint8Array {
    return keccak256Hash(utils.hexToBytes(topic), index)
  }

  private makeSequentialFeedIdentifier(topic: string, index: number): Uint8Array {
    const indexBytes = writeUint64BigEndian(index)

    return this.hashFeedIdentifier(topic, indexBytes)
  }

  private makeFeedIndexBytes(s: string): Uint8Array {
    const hex = makeHexString(s)

    return utils.hexToBytes(hex)
  }
}

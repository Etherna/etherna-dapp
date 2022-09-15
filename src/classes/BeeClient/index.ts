import axios from "axios"
import type { AxiosInstance } from "axios"

import Auth from "./auth"
import Bytes from "./bytes"
import Bzz from "./bzz"
import ChainState from "./chainstate"
import Chunk from "./chunk"
import Feed from "./feeds"
import Pins from "./pins"
import Soc from "./soc"
import Stamps from "./stamps"
import type { PostageBatch, Signer } from "./types"
import { makePrivateKeySigner } from "./utils/signer"
import { createRequest } from "@/utils/request"

type BeeClientOptions = {
  signer?: Signer | string
  postageBatches?: PostageBatch[]
}

export default class BeeClient {
  signer?: Signer
  request: AxiosInstance

  auth: Auth
  bytes: Bytes
  bzz: Bzz
  chainstate: ChainState
  chunk: Chunk
  feed: Feed
  pins: Pins
  soc: Soc
  stamps: Stamps

  postageBatches: PostageBatch[]

  constructor(public url: string, opts?: BeeClientOptions) {
    this.signer =
      typeof opts?.signer === "string" ? makePrivateKeySigner(opts.signer) : opts?.signer
    this.request = createRequest({
      baseURL: url,
      withCredentials: true,
    })
    this.auth = new Auth(this)
    this.bytes = new Bytes(this)
    this.bzz = new Bzz(this)
    this.chainstate = new ChainState(this)
    this.chunk = new Chunk(this)
    this.feed = new Feed(this)
    this.pins = new Pins(this)
    this.soc = new Soc(this)
    this.stamps = new Stamps(this)
    this.postageBatches = opts?.postageBatches ?? []
  }

  /**
   * Check if an hash is a valid swarm hash
   *
   * @param hash Hash string
   * @returns True if the hash is valid
   */
  static isValidHash(hash: string) {
    return /^[0-9a-f]{64}$/.test(hash)
  }

  isValidHash(hash: string) {
    return BeeClient.isValidHash(hash)
  }
}

import type { BATCH_ID_HEX_LENGTH, REFERENCE_HEX_LENGTH } from "./utils/contants"

export type EthAddress = `0x${string}`

type SyncSigner = (digest: string | Uint8Array) => string
type AsyncSigner = (digest: string | Uint8Array) => Promise<string>

export type Signer = {
  sign: SyncSigner | AsyncSigner
  address: EthAddress
}

export type FeedInfo = {
  topic: string
  owner: string
  type: "sequence" | "epoch"
}

export type Epoch = {
  time: number
  level: number
}

export type Index = number | Epoch | Uint8Array | string

export declare type HexString<Length = number> = string & {
  readonly length: Length
}

export type BatchId = HexString<typeof BATCH_ID_HEX_LENGTH>

export type Reference = HexString<typeof REFERENCE_HEX_LENGTH>

export type PostageBatch = {
  batchID: BatchId
  utilization: number
  usable: boolean
  label: string
  depth: number
  amount: string
  bucketDepth: number
  blockNumber: number
  immutableFlag: boolean
  /**
   * The time (in seconds) remaining until the batch expires;
   * -1 signals that the batch never expires;
   * 0 signals that the batch has already expired.
   */
  batchTTL: number
  exists: boolean
}

export type FeedUpdateHeaders = {
  /**
   * The current feed's index
   */
  feedIndex: string
  /**
   * The feed's index for next update.
   * Only set for the latest update. If update is fetched using previous index, then this is an empty string.
   */
  feedIndexNext: string
}

export type Chunk = {
  readonly data: Uint8Array
  /** span bytes (8) */
  span(): Uint8Array
  /** payload bytes (1-4096) */
  payload(): Uint8Array
  address(): Uint8Array
}

export type SingleOwnerChunk = Chunk & {
  identifier(): Uint8Array
  signature(): Uint8Array
  owner(): Uint8Array
}

export interface Data extends Uint8Array {
  /**
   * Converts the binary data using UTF-8 decoding into string.
   */
  text(): string
  /**
   * Converts the binary data into hex-string.
   */
  hex(): HexString
  /**
   * Converts the binary data into string which is then parsed into JSON.
   */
  json(): Record<string, unknown>
}

export interface RequestOptions {
  timeout?: number
  signal?: AbortSignal
  headers?: Record<string, string>
}

export interface RequestUploadOptions extends RequestOptions {
  batchId: string
  pin?: boolean
  encrypt?: boolean
  tag?: string
  deferred?: boolean
}

export interface RequestUploadOptions extends RequestUploadOptions {
  onUploadProgress?(completion: number): void
}

export interface RequestDownloadOptions extends RequestOptions {
  onDownloadProgress?(completion: number): void
}

export interface FileUploadOptions extends RequestUploadOptions {
  size?: number
  contentType?: string
  filename?: string
}

export interface FileDownloadOptions extends RequestDownloadOptions {
  maxResponseSize?: number
}

export interface FeedUpdateOptions extends RequestOptions {
  index?: string
  at?: number
}

export interface FeedUploadOptions extends RequestUploadOptions {
  index?: string
  at?: number
}

export interface AuthenticationOptions extends RequestOptions {
  role?: "maintainer" | "creator" | "auditor" | "consumer"
  expiry?: number
}

export interface ReferenceResponse {
  reference: Reference
}

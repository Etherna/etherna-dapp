import { utils } from "@noble/secp256k1"

import type BeeClient from "."
import type {
  Chunk,
  EthAddress,
  ReferenceResponse,
  RequestOptions,
  RequestUploadOptions,
  SingleOwnerChunk,
} from "./types"
import { bmtHash } from "./utils/bmt"
import { bytesAtOffset, bytesEqual, flexBytesAtOffset, serializeBytes } from "./utils/bytes"
import { makeContentAddressedChunk } from "./utils/chunk"
import {
  IDENTIFIER_SIZE,
  SIGNATURE_SIZE,
  SOC_IDENTIFIER_OFFSET,
  SOC_PAYLOAD_OFFSET,
  SOC_SIGNATURE_OFFSET,
  SOC_SPAN_OFFSET,
  SPAN_SIZE,
} from "./utils/contants"
import { keccak256Hash } from "./utils/hash"
import { extractUploadHeaders } from "./utils/headers"
import { makeHexString } from "./utils/hex"
import { recoverAddress } from "./utils/signer"

const socEndpoint = "/soc"

export default class Soc {
  constructor(private instance: BeeClient) {}

  async download(identifier: Uint8Array, ownerAddress: EthAddress, options?: RequestOptions) {
    const addressBytes = utils.hexToBytes(makeHexString(ownerAddress))
    const address = this.makeSOCAddress(identifier, addressBytes)
    const data = await this.instance.chunk.download(utils.bytesToHex(address), options)

    return this.makeSingleOwnerChunkFromData(data, address)
  }

  async upload(identifier: Uint8Array, data: Uint8Array, options: RequestUploadOptions) {
    const cac = makeContentAddressedChunk(data)
    const soc = await this.makeSingleOwnerChunk(cac, identifier)

    const owner = utils.bytesToHex(soc.owner())
    const signature = utils.bytesToHex(soc.signature())
    const payload = serializeBytes(soc.span(), soc.payload())
    const hexIdentifier = utils.bytesToHex(identifier)

    const resp = await this.instance.request.post<ReferenceResponse>(
      `${socEndpoint}/${owner}/${hexIdentifier}`,
      payload,
      {
        headers: {
          "content-type": "application/octet-stream",
          ...extractUploadHeaders(options),
        },
        params: { sig: signature },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )

    return {
      reference: resp.data.reference,
    }
  }

  // Utils

  /**
   * Creates a single owner chunk object
   *
   * @param chunk       A chunk object used for the span and payload
   * @param identifier  The identifier of the chunk
   */
  async makeSingleOwnerChunk(chunk: Chunk, identifier: Uint8Array): Promise<SingleOwnerChunk> {
    if (!this.instance.signer) {
      throw new Error("No signer provided")
    }

    const chunkAddress = chunk.address()

    const digest = keccak256Hash(identifier, chunkAddress)
    const signature = utils.hexToBytes(makeHexString(await this.instance.signer.sign(digest)))
    const data = serializeBytes(identifier, signature, chunk.span(), chunk.payload())
    const signerAddress = utils.hexToBytes(makeHexString(this.instance.signer!.address))
    const address = this.makeSOCAddress(identifier, signerAddress)

    return {
      data,
      identifier: () => identifier,
      signature: () => signature,
      span: () => chunk.span(),
      payload: () => chunk.payload(),
      address: () => address,
      owner: () => signerAddress,
    }
  }

  private makeSOCAddress(identifier: Uint8Array, address: Uint8Array) {
    return keccak256Hash(identifier, address)
  }

  private makeSingleOwnerChunkFromData(data: Uint8Array, address: Uint8Array): SingleOwnerChunk {
    const ownerAddress = this.recoverChunkOwner(data)
    const identifier = bytesAtOffset(data, SOC_IDENTIFIER_OFFSET, IDENTIFIER_SIZE)
    const socAddress = keccak256Hash(identifier, ownerAddress)

    if (!bytesEqual(address, socAddress)) {
      throw new Error("SOC Data does not match given address!")
    }

    const signature = () => bytesAtOffset(data, SOC_SIGNATURE_OFFSET, SIGNATURE_SIZE)
    const span = () => bytesAtOffset(data, SOC_SPAN_OFFSET, SPAN_SIZE)
    const payload = () => flexBytesAtOffset(data, SOC_PAYLOAD_OFFSET)

    return {
      data,
      identifier: () => identifier,
      signature,
      span,
      payload,
      address: () => socAddress,
      owner: () => ownerAddress,
    }
  }

  private recoverChunkOwner(data: Uint8Array): Uint8Array {
    const cacData = data.slice(SOC_SPAN_OFFSET)
    const chunkAddress = bmtHash(cacData)
    const signature = bytesAtOffset(data, SOC_SIGNATURE_OFFSET, SIGNATURE_SIZE)
    const identifier = bytesAtOffset(data, SOC_IDENTIFIER_OFFSET, IDENTIFIER_SIZE)
    const digest = keccak256Hash(identifier, chunkAddress)
    const ownerAddress = recoverAddress(signature, digest)

    return ownerAddress
  }
}

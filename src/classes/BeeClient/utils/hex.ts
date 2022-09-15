import { utils } from "@noble/secp256k1"

import type { EthAddress } from "../types"

/**
 * Creates unprefixed hex string from wide range of data.
 *
 * @param input
 */
export function makeHexString(input: string | number | Uint8Array | EthAddress): string {
  if (typeof input === "number") {
    return input.toString(16)
  }

  if (input instanceof Uint8Array) {
    return utils.bytesToHex(input)
  }

  if (typeof input === "string") {
    return input.replace(/^0x/, "")
  }

  throw new TypeError("Not HexString compatible type!")
}

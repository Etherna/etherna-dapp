import { utils } from "@noble/secp256k1"

import type { Data } from "../types"

/**
 * Function that verifies if passed data are Bytes and if the array has "length" number of bytes under given offset.
 * @param data
 * @param offset
 * @param length
 */
export function hasBytesAtOffset(data: unknown, offset: number, length: number): boolean {
  if (!(data instanceof Uint8Array)) {
    throw new TypeError("Data has to an Uint8Array!")
  }

  const offsetBytes = data.slice(offset, offset + length)
  return offsetBytes.length === length
}

/**
 * Return `length` bytes starting from `offset`
 *
 * @param data   The original data
 * @param offset The offset to start from
 * @param length The length of data to be returned
 */
export function bytesAtOffset<Length extends number>(
  data: Uint8Array,
  offset: number,
  length: Length
): Uint8Array {
  const offsetBytes = data.slice(offset, offset + length)
  return offsetBytes
}

/**
 * Returns a new byte array filled with zeroes with the specified length
 *
 * @param length The length of data to be returned
 */
export function makeBytes(length: number): Uint8Array {
  return new Uint8Array(length)
}

/**
 * Helper function for serialize byte arrays
 *
 * @param arrays Any number of byte array arguments
 */
export function serializeBytes(...arrays: Uint8Array[]): Uint8Array {
  const length = arrays.reduce((prev, curr) => prev + curr.length, 0)
  const buffer = new Uint8Array(length)
  let offset = 0
  arrays.forEach(arr => {
    buffer.set(arr, offset)
    offset += arr.length
  })

  return buffer
}

/**
 * Return flex bytes starting from `offset`
 *
 * @param data   The original data
 * @param offset The offset to start from
 */
export function flexBytesAtOffset(data: Uint8Array, offset: number): Uint8Array {
  return data.slice(offset)
}

export function wrapBytesWithHelpers(data: Uint8Array): Data {
  return Object.assign(data, {
    text: () => new TextDecoder("utf-8").decode(data),
    json: () => JSON.parse(new TextDecoder("utf-8").decode(data)),
    hex: () => utils.bytesToHex(data),
  })
}

/**
 * Returns true if two byte arrays are equal
 *
 * @param a Byte array to compare
 * @param b Byte array to compare
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

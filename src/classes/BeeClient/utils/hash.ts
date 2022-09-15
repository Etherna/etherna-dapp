import { keccak256 } from "js-sha3"
import type { Message } from "js-sha3"

/**
 * Helper function for calculating the keccak256 hash with
 * correct types.
 *
 * @param messages Any number of messages (strings, byte arrays etc.)
 */
export function keccak256Hash(...messages: Message[]): Uint8Array {
  const hasher = keccak256.create()

  messages.forEach(bytes => hasher.update(bytes))

  return Uint8Array.from(hasher.digest())
}

import { utils, getPublicKey, sign, Signature, recoverPublicKey } from "@noble/secp256k1"

import type { EthAddress, Signer } from "../types"
import { keccak256Hash } from "./hash"
import { makeHexString } from "./hex"

const UNCOMPRESSED_RECOVERY_ID = 27

/**
 * Creates a singer object that can be used when the private key is known.
 *
 * @param privateKey The private key
 */
export function makePrivateKeySigner(privateKey: string): Signer {
  const privKey = utils.hexToBytes(privateKey.replace(/^0x/, ""))
  const pubKey = getPublicKey(privKey)

  const address = publicKeyToAddress(pubKey)

  return {
    sign: digest => defaultSign(digest, privKey),
    address,
  }
}

/**
 * The default signer function that can be used for integrating with
 * other applications (e.g. wallets).
 *
 * @param data      The data to be signed
 * @param privateKey  The private key used for signing the data
 */
export async function defaultSign(
  data: Uint8Array | string,
  privateKey: Uint8Array
): Promise<string> {
  const hashedDigest = hashWithEthereumPrefix(
    typeof data === "string" ? new TextEncoder().encode(data) : data
  )
  const [sigRaw, recovery] = await sign(hashedDigest, privateKey, {
    canonical: true,
    // der: true,
    recovered: true,
  })
  const signatureRaw = Signature.fromDER(sigRaw)

  const signature = new Uint8Array([
    ...signatureRaw.toCompactRawBytes(),
    recovery + UNCOMPRESSED_RECOVERY_ID,
  ])

  return utils.bytesToHex(signature)
}

/**
 * Recovers the ethereum address from a given signature.
 *
 * Can be used for verifying a piece of data when the public key is
 * known.
 *
 * @param signature The signature
 * @param digest    The digest of the data
 *
 * @returns the recovered address
 */
export function recoverAddress(signature: Uint8Array, digest: Uint8Array): Uint8Array {
  const recoveryParam = signature[64]! - UNCOMPRESSED_RECOVERY_ID
  const hash = hashWithEthereumPrefix(digest)
  const recPubKey = recoverPublicKey(hash, signature.slice(0, 64), recoveryParam)
  const address = makeHexString(publicKeyToAddress(recPubKey))

  return utils.hexToBytes(address)
}

function publicKeyToAddress(pubKey: Uint8Array): EthAddress {
  const addressBytes = keccak256Hash(pubKey.slice(1)).slice(12)
  const address = utils.bytesToHex(addressBytes).replace(/^0x/, "")
  return `0x${address}`
}

function hashWithEthereumPrefix(data: Uint8Array): Uint8Array {
  const ethereumSignedMessagePrefix = `\x19Ethereum Signed Message:\n${data.length}`
  const prefixBytes = new TextEncoder().encode(ethereumSignedMessagePrefix)

  return keccak256Hash(prefixBytes, data)
}

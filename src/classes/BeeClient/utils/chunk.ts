/**
 * BSD 3-Clause License

 * Copyright (c) 2022, The Swarm Authors
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { Chunk } from "../types"
import { bmtHash } from "./bmt"
import { flexBytesAtOffset, serializeBytes } from "./bytes"
import { CAC_PAYLOAD_OFFSET, MAX_SPAN_LENGTH, SPAN_SIZE } from "./contants"

/**
 * Creates a content addressed chunk and verifies the payload size.
 *
 * @param payloadBytes the data to be stored in the chunk
 */
export function makeContentAddressedChunk(payloadBytes: Uint8Array): Chunk {
  const span = makeSpan(payloadBytes.length)
  const data = serializeBytes(span, payloadBytes)

  return {
    data,
    span: () => span,
    payload: () => flexBytesAtOffset(data, CAC_PAYLOAD_OFFSET),
    address: () => bmtHash(data),
  }
}

/**
 * Create a span for storing the length of the chunk
 *
 * The length is encoded in 64-bit little endian.
 *
 * @param length The length of the span
 */
export function makeSpan(length: number): Uint8Array {
  if (length <= 0) {
    throw new Error("invalid length for span")
  }

  if (length > MAX_SPAN_LENGTH) {
    throw new Error("invalid length (> MAX_SPAN_LENGTH)")
  }

  const span = new Uint8Array(SPAN_SIZE)
  const dataView = new DataView(span.buffer)
  const littleEndian = true
  const lengthLower32 = length & 0xffffffff

  dataView.setUint32(0, lengthLower32, littleEndian)

  return span
}

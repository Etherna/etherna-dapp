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

import { stringPadLeft } from "./string"

const BYTES_MAP = {
  b: 0.125,
  bytes: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024,
}

type BytesScale = keyof typeof BYTES_MAP

/**
 * Convert bytes into bits, kbytes, mbytes etc...
 *
 * @param fromBytes Bytes reference value
 * @param decimals Number of decimal palces (default = 2)
 * @returns Each converted amount
 */
export const convertBytes = (fromBytes: number | string, decimals = 2) => {
  const normalizedValue = `${fromBytes}`.toLowerCase()
  const matches = normalizedValue.match(
    /^(?<val>[0-9]+\.?[0-9]*|\.[0-9]+)[ ]*(?<scale>bytes|kb|mb|gb|tb)?/
  )
  const value = +(matches?.groups?.val ?? fromBytes)
  const scale = (matches?.groups?.scale ?? "bytes").replace(/s?/, "") as BytesScale
  const k = 1024
  const scales = Object.keys(BYTES_MAP)

  const bits = (value * BYTES_MAP[scale]) / BYTES_MAP["b"]
  const bytes = (value * BYTES_MAP[scale]) / BYTES_MAP["bytes"]
  const kbytes = (value * BYTES_MAP[scale]) / BYTES_MAP["kb"]
  const mbytes = (value * BYTES_MAP[scale]) / BYTES_MAP["mb"]
  const gbytes = (value * BYTES_MAP[scale]) / BYTES_MAP["gb"]

  const dm = decimals < 0 ? 0 : decimals
  const i =
    bytes <= 0 || isNaN(bytes)
      ? 0
      : Math.min(Math.floor(Math.log(bytes) / Math.log(k)), scales.length - 2)
  const readableValue = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
  const readable = `${readableValue} ${scales[i + 1].toUpperCase()}`

  return {
    bits,
    bytes,
    kbytes,
    mbytes,
    gbytes,
    readable,
  }
}

/**
 * Convert bitrate
 *
 * @param fromBytesPerSec Bytes per second amount
 * @returns Object containing converted bitrate values
 */
export const convertBirate = (fromBytesPerSec: number | string) => {
  const conversions = convertBytes(fromBytesPerSec)
  const readableValue = parseFloat(conversions.mbytes.toFixed(2))
  const readable = `${readableValue} MB/s`

  return {
    bits_s: conversions.bits,
    bytes_s: conversions.bytes,
    kbytes_s: conversions.kbytes,
    mbytes_s: conversions.mbytes,
    readable,
  }
}

/**
 * Convert time from seconds
 *
 * @param seconds Seconds amount
 * @returns Object with various time conversions
 */
export const convertTime = (seconds: number) => {
  seconds = Math.round(seconds)

  const minutes = Math.round(seconds / 60)
  const hours = +(minutes / 60).toFixed(1)
  const readable =
    seconds > 120
      ? minutes > 60 * 60 * 2
        ? `${hours} ${hours >= 2 ? "hours" : "hour"}`
        : `${minutes} ${minutes >= 2 ? "minutes" : "minute"}`
      : `${seconds} ${seconds >= 2 ? "seconds" : "second"}`
  const digital = `${stringPadLeft(hours)}:${stringPadLeft(minutes)}:${stringPadLeft(seconds)}`
  return {
    seconds,
    minutes,
    hours,
    readable,
    digital,
  }
}

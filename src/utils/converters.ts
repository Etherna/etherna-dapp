const BYTES_MAP = {
  b: 0.125,
  byte: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024,
}

type BytesScale = keyof typeof BYTES_MAP

export const convertBytes = (fromBytes: number | string, decimals = 2) => {
  const normalizedValue = `${fromBytes}`.toLowerCase()
  const matches = normalizedValue.match(/^(?<val>[0-9]+\.?[0-9]*|\.[0-9]+)[ ]*(?<scale>bytes|kb|mb|gb|tb)?/)
  const value = +(matches?.groups?.val ?? fromBytes)
  const scale = (matches?.groups?.scale ?? "byte").replace(/s?/, "") as BytesScale
  const k = 1024
  const scales = Object.keys(BYTES_MAP)

  const bits = value * BYTES_MAP[scale] / BYTES_MAP["b"]
  const bytes = value * BYTES_MAP[scale] / BYTES_MAP["byte"]
  const kbytes = value * BYTES_MAP[scale] / BYTES_MAP["kb"]
  const mbytes = value * BYTES_MAP[scale] / BYTES_MAP["mb"]
  const gbytes = value * BYTES_MAP[scale] / BYTES_MAP["gb"]

  const dm = decimals < 0 ? 0 : decimals
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), scales.length - 2)
  const readableValue = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
  const readable = `${readableValue} ${scales[i + 1].toUpperCase()}`

  return {
    bits,
    bytes,
    kbytes,
    mbytes,
    gbytes,
    readable
  }
}

export const convertBirate = (fromBytesPerSec: number | string) => {
  const conversions = convertBytes(fromBytesPerSec)
  const readableValue = parseFloat(conversions.mbytes.toFixed(2))
  const readable = `${readableValue} MB/s`

  return {
    bits_s: conversions.bits,
    bytes_s: conversions.bytes,
    kbytes_s: conversions.kbytes,
    mbytes_s: conversions.mbytes,
    readable
  }
}

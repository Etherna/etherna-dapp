const { Transform } = require("stream")

class FilterTransformStream extends Transform {
  /**
   * @param {number} maxBodySize
   * @param {import("stream").TransformOptions} options
   */
  constructor(maxBodySize, options) {
    super(options)

    this.maxBodySize = maxBodySize
    this.streamedBytes = 0
  }

  _transform(chunk, encoding, callback) {
    // Verify if stream has to be truncated.
    const streamableBytes = this.maxBodySize - this.streamedBytes

    if (streamableBytes < chunk.byteLength) {
      //truncate value for available length and send it to browser
      const newChunk = chunk.slice(0, streamableBytes)
      callback(null, newChunk)
      this.streamedBytes += newChunk.byteLength

      //close stream
      callback(null, null)
    } else {
      //get full length value and send it to browser
      callback(null, chunk)
      this.streamedBytes += chunk.byteLength
    }
  }
}

module.exports = FilterTransformStream

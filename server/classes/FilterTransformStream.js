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

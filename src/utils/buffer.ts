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

/**
 * Get the array buffer of a file
 *
 * @param file File to convert
 * @returns The array buffer data
 */
export const fileToBuffer = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    let fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer)
    }
    fr.onabort = reject
    fr.onerror = reject
    fr.readAsArrayBuffer(file)
  })
}
/**
 * Get the array buffer of a file
 *
 * @param file File to convert
 * @returns The array buffer data
 */
export const fileToUint8Array = async (file: File) => {
  const buffer = await fileToBuffer(file)
  return new Uint8Array(buffer)
}

/**
 * Convert a file to a data URL string
 *
 * @param file File to convert
 * @returns The base64 data URL
 */
export const fileToDataURL = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result as string)
    }
    fr.onabort = reject
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
}

/**
 * Convert a buffer to a File object
 *
 * @param buffer Buffer to convert
 * @param contentType Mime type of the array buffer
 * @returns The file object
 */
export const bufferToFile = (buffer: ArrayBuffer, contentType?: string) => {
  return new Blob([buffer], { type: contentType }) as File
}

/**
 * Convert a buffer to a data URL string
 *
 * @param buffer Buffer to convert
 * @returns The base64 data URL
 */
export const bufferToDataURL = (buffer: ArrayBuffer) => fileToDataURL(bufferToFile(buffer))

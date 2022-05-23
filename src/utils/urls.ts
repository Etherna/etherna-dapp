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
 * Convert unsafe url string to a safe version
 * to be used in URL class
 * 
 * @param url Url to convert
 * @param path Path to append (optional)
 * @returns The safe URL object
 */
export const safeURL = (url: string | null | undefined, path?: string) => {
  try {
    let baseUrl = (url ?? "")
    if (!/https?:\/\//.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`
    }
    return new URL(path ?? "", baseUrl)
  } catch (error: any) {
    return null
  }
}

/**
 * Check if url is safe to use in URL class
 * 
 * @param url Url to check
 * @param path Path to append
 * @returns True if safe
 */
export const isSafeURL = (url: string | null | undefined, path?: string) => {
  try {
    let baseUrl = (url ?? "")
    if (!/https?:\/\//.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`
    }
    new URL(path ?? "", baseUrl)
    return true
  } catch (error: any) {
    return false
  }
}

/**
 * Get the url origin
 * 
 * @param baseUrl Reference url
 * @returns The url origin
 */
export const urlOrigin = (baseUrl: string) => {
  return safeURL(baseUrl)?.origin
}

/**
 * Get the url hostname
 * 
 * @param baseUrl Reference url
 * @returns The url hostname
 */
export const urlHostname = (baseUrl: string) => {
  return safeURL(baseUrl)?.hostname
}

/**
 * Get the url href
 * 
 * @param baseUrl Reference url
 * @param path Path to append (optional)
 * @returns The url href
 */
export const urlPath = (baseUrl: string, path?: string) => {
  return safeURL(baseUrl, path)?.href
}

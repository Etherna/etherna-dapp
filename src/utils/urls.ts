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

export const urlOrigin = (baseUrl: string) => {
  return safeURL(baseUrl)?.origin
}

export const urlHostname = (baseUrl: string) => {
  return safeURL(baseUrl)?.hostname
}

export const urlPath = (baseUrl: string, path?: string) => {
  return safeURL(baseUrl, path)?.href
}

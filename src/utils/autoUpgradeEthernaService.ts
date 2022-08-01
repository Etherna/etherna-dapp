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

import { IndexExtensionHost } from "@/definitions/extension-host"
import { parseLocalStorage } from "./local-storage"
import { urlOrigin } from "./urls"

/**
 * Update the local storage with the
 * upgraded etherna service url.
 * 
 * @param localSettingKey Local storage key of the current service url
 * @param newUrl New url of the service
 */
export default function autoUpgradeEthernaService(localSettingKey: string, newUrl: string) {
  const localUrls = parseLocalStorage<string | (IndexExtensionHost)[]>(localSettingKey)

  if (!localUrls) return

  if (typeof localUrls === "string") {
    const url = upgradeUrl(localUrls, newUrl)
    localStorage.setItem(localSettingKey, JSON.stringify(url))
  } else {
    const urls = localUrls.map(extension => ({
      ...extension,
      url: upgradeUrl(extension.url, newUrl)
    }))
    localStorage.setItem(localSettingKey, JSON.stringify(urls))
  }
}

function upgradeUrl(url: string, upgradeUrl: string) {
  if (urlOrigin(url) !== urlOrigin(upgradeUrl)) return url

  return upgradeUrl
}

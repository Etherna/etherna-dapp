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
import { urlOrigin } from "@etherna/api-js/utils"

import { parseLocalStorage } from "./local-storage"
import clientsStore from "@/stores/clients"

import type { IndexExtensionHost } from "@/types/extension-host"

export const autoRedirect = () => {
  if (window.location.host.startsWith("www")) {
    const location = new URL(window.location.href)
    location.host = location.host.replace("www.", "")
    window.location.href = location.href
  }
}

export const autoSigninSignout = () => {
  const searchParams = new URLSearchParams(window.location.search)

  // login redirect
  let service = searchParams.get("signin")
  if (service) {
    loginRedirect(service)
  }

  // logout redirect
  service = searchParams.get("signout")
  if (service) {
    logoutRedirect(service)
  }
}

/**
 * Update the local storage with the
 * upgraded etherna service url.
 *
 * @param localSettingKey Local storage key of the current service url
 * @param newUrl New url of the service
 */
export const autoUpgradeEthernaService = (localSettingKey: string, newUrl: string) => {
  const localUrls = parseLocalStorage<string | IndexExtensionHost[]>(localSettingKey)

  if (!localUrls) return

  if (typeof localUrls === "string") {
    const url = upgradeUrl(localUrls, newUrl)
    localStorage.setItem(localSettingKey, JSON.stringify(url))
  } else {
    const urls = localUrls.map(extension => ({
      ...extension,
      url: upgradeUrl(extension.url, newUrl),
    }))
    localStorage.setItem(localSettingKey, JSON.stringify(urls))
  }
}

/**
 * Redirect to the service login page
 *
 * @param service Service to signin
 */
export const logoutRedirect = (service: "index" | "gateway" | String | null = null) => {
  const { indexClient, gatewayClient } = clientsStore.getState()

  // strip query params
  const redirectUrl = window.location.origin + window.location.pathname

  switch (service) {
    case "index":
      indexClient.logoutRedirect(redirectUrl)
      break
    case "gateway":
      gatewayClient.logoutRedirect(redirectUrl)
      break
    case null:
    case undefined:
      indexClient.logoutRedirect(redirectUrl + "?signout=gateway")
      break
    default:
      break
  }
}

/**
 * Redirect to the service login page
 *
 * @param service Service to signin
 */
export const loginRedirect = (service: "index" | "gateway" | string | null = null) => {
  const { indexClient, gatewayClient } = clientsStore.getState()

  // strip query params
  const redirectUrl = window.location.origin + window.location.pathname

  switch (service) {
    case "index":
      indexClient.loginRedirect(redirectUrl)
      break
    case "gateway":
      gatewayClient.loginRedirect(redirectUrl)
      break
    case null:
    case undefined:
      indexClient.loginRedirect(redirectUrl + "?signin=gateway")
      break
    default:
      break
  }
}

const upgradeUrl = (url: string, upgradeUrl: string) => {
  if (urlOrigin(url) !== urlOrigin(upgradeUrl)) return url

  return upgradeUrl
}

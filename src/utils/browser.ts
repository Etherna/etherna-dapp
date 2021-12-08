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
 * Check if current browser is a mobile browser.
 */
export const checkIsMobile = () => {
  let isMobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true
  } else {
    isMobile = false
  }
  return isMobile
}

/**
 * Check if current browser is a mobile browser without web3 instance.
 */
export const checkIsMobileWithoutWeb3 = () => {
  let isMobileWithWeb3 = false
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const hasWeb3 =
    typeof window.web3 !== "undefined" ||
    typeof window.ethereum !== "undefined"
  if (isMobile && !hasWeb3) isMobileWithWeb3 = true
  return isMobileWithWeb3
}

/**
 * Check if current device is a mobile
 */
export const checkIsMobileDevice = () => {
  return (
    (window && typeof window.orientation !== "undefined") ||
    (navigator && navigator.userAgent.indexOf("IEMobile") !== -1)
  )
}

/**
 * Check if current device is touch
 */
export const isTouchDevice = () => {
  return (("ontouchstart" in window) ||
    (navigator.maxTouchPoints > 0) ||
    ((navigator.msMaxTouchPoints ?? 0) > 0))
}

/**
 * Check if current user agent is a bot or crawler
 */
export const isBotUserAgent = () => {
  return /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)
}

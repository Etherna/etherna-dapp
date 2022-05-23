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
 * Check if current browser doesn't support some features used within the app
 * 
 * @returns True if legacy browser
 */
export const checkIsLegacyBrowser = () => {
  if (typeof MutationObserver === "undefined") return true
  if (typeof ResizeObserver === "undefined") return true
  if (typeof TextEncoder === "undefined") return true
  if (typeof TextDecoder === "undefined") return true
  if (typeof Uint8ClampedArray === "undefined") return true
  if (typeof ArrayBuffer === "undefined") return true
  if (typeof URL === "undefined") return true
  if (typeof URLSearchParams === "undefined") return true
  if (typeof URL.createObjectURL === "undefined") return true
  if (typeof URL.revokeObjectURL === "undefined") return true
  if (typeof fetch === "undefined") return true
  if (
    typeof (window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame) === "undefined"
  ) return true
  if (!supportCssGrid()) return true
  if (!supportCssVariables()) return true
  return false
}

const supportCssGrid = () => {
  let supportsSmoothScrolling = false
  document.body.style.display = "grid"
  supportsSmoothScrolling = getComputedStyle(document.body).display === "grid"
  document.body.style.display = ""
  return supportsSmoothScrolling
}

const supportCssVariables = () => {
  const s = document.createElement("style")
  let support = true

  s.innerHTML = ":root { --tmp-var: bold; }"
  document.head.appendChild(s)
  support = !!(window.CSS && window.CSS.supports && window.CSS.supports("font-weight", "var(--tmp-var)"))
  s.parentNode!.removeChild(s)
  return support
}

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
  const hasWeb3 = typeof window.ethereum !== "undefined"
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

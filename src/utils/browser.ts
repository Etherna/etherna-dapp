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

import { detect } from "detect-browser"

import { store } from "../state/store"

export const checkIsMobile = () => {
    let isMobile
    if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    ) {
        isMobile = true
    } else {
        isMobile = false
    }
    return isMobile
}

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

export const isBrowserCompatible = () => {
    const browser = detect()
    const { version, name } = browser

    if (name !== "safari") return true

    const majorVersion = parseInt(version.split(".")[0])
    const minorVersion = parseInt(version.split(".")[1])
    if (majorVersion > 11 || (majorVersion === 11 && minorVersion >= 1))
        return true
    if (majorVersion < 11 || (majorVersion === 11 && minorVersion < 1)) {
        store.dispatch({
            type: "UI_UNSUPPORTED_BROWSER_MODAL",
            showUnsupportedBrowser: true,
        })
        return false
    }
}

export const checkIsMobileDevice = () => {
    return (
        (window && typeof window.orientation !== "undefined") ||
        (navigator && navigator.userAgent.indexOf("IEMobile") !== -1)
    )
}

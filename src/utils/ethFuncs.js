export const checkIsEthAddress = string => {
    const isEthereumAddress = /^(0x)?[0-9a-f]{40}$/i.test(string)
    return isEthereumAddress
}

export const shortenEthAddr = str => {
    const shortenStr =
        str &&
        `${str.substring(0, 5)}...${str.substring(str.length - 5, str.length)}`
    return shortenStr
}

export const checkUsingInjectedProvider = provider => {
    const {
        isFortmatic,
        isPortis,
        isWalletConnect,
        isSquarelink,
        isAuthereum,
    } = provider

    if (
        isFortmatic ||
        isPortis ||
        isWalletConnect ||
        isSquarelink ||
        isAuthereum
    )
        return false
    return true
}

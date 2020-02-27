import { ethers } from "ethers"

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

export const fetchAccounts = async web3 => {
    let accounts = []

    if (!web3) {
        throw new Error("Web3 instance is null")
    }

    if (web3.currentProvider) {
        accounts = await web3.currentProvider.enable()
    } else {
        accounts = await web3.eth.getAccounts()
    }

    accounts = accounts.map(a => web3.utils.toChecksumAddress(a))
    return accounts
}

export const resolveEnsName = async (address, web3) => {
    const currentProvider = web3
        ? web3.currentProvider
        : window.web3 && window.web3.currentProvider

    if (currentProvider) {
        const provider = new ethers.providers.Web3Provider(currentProvider)
        const name = await provider.lookupAddress(address)
        return name
    }

    return undefined
}

export const getNetworkName = networkId => {
    switch (networkId) {
        case 1:
            return "Main"
        case 2:
            return "Morder"
        case 3:
            return "Ropsten"
        case 4:
            return "Rinkeby"
        case 42:
            return "Kovan"
        default:
            return "Unknown"
    }
}

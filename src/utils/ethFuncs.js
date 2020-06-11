import { ethers } from "ethers"

/**
 * Check if a string a valid eth address
 * @param {string} address Address string value
 */
export const checkIsEthAddress = address => {
    const isEthereumAddress = /^(0x)?[0-9a-f]{40}$/i.test(address)
    return isEthereumAddress
}

/**
 * Get the shorten string of a address
 * @param {string} address Address string value
 */
export const shortenEthAddr = address => {
    const shortenStr =
        address &&
        `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`
    return shortenStr
}

/**
 * Check if a provider is injected by the browser
 * @param {object} provider Web3 provider
 */
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

/**
 * Fetch the wallet accounts
 * @param {web3} web3 Web3 instance
 */
export const fetchAccounts = async web3 => {
    let accounts = []

    if (!web3) {
        throw new Error("Web3 instance is null")
    }

    if (web3.currentProvider && web3.currentProvider.enable) {
        accounts = await web3.currentProvider.enable()
    } else {
        accounts = await web3.eth.getAccounts()
    }

    accounts = accounts.map(a => web3.utils.toChecksumAddress(a))
    return accounts
}

/**
 * Resolve the ens of a eth address
 * @param {string} address Address of the ens to fetch
 * @param {web3} web3 Web3 instance
 */
export const resolveEnsName = async (address, web3) => {
    const currentProvider = web3
        ? web3.currentProvider
        : window.web3 && window.web3.currentProvider

    if (currentProvider && address) {
        const provider = new ethers.providers.Web3Provider(currentProvider)
        const name = await provider.lookupAddress(address)
        return name
    }

    return undefined
}

/**
 * Get the network name from the id
 * @param {number} networkId Id of the networks
 */
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

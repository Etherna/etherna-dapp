import Web3 from "web3"

/**
 * Check if a string a valid eth address
 * @param address Address string value
 */
export const checkIsEthAddress = (address: string|null|undefined) => {
  const isEthereumAddress = /^(0x)?[0-9a-f]{40}$/i.test(address || "")
  return isEthereumAddress
}

/**
 * Get the shorten string of a address
 * @param address Address string value
 */
export const shortenEthAddr = (address: string|null|undefined) => {
  if (address) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`
  }
  return ""
}

/**
 * Check if a provider is injected by the browser
 * @param provider Web3 provider
 */
export const checkUsingInjectedProvider = (provider: any) => {
  const { isFortmatic, isPortis, isWalletConnect, isSquarelink, isAuthereum } = provider

  if (isFortmatic || isPortis || isWalletConnect || isSquarelink || isAuthereum) return false
  return true
}

/**
 * Fetch the wallet accounts
 * @param web3 Web3 instance
 */
export const fetchAccounts = async (web3: Web3) => {
  let accounts: string[] = []

  if (!web3) {
    throw new Error("Web3 instance is null")
  }

  const provider = web3.currentProvider

  if (provider && (provider as any).enable) {
    accounts = await (provider as any).enable()
  } else {
    accounts = await web3.eth.getAccounts()
  }

  accounts = accounts.map(a => web3.utils.toChecksumAddress(a))
  return accounts
}

/**
 * Resolve the ens of a eth address
 * @param address Address of the ens to fetch
 * @param web3 Web3 instance
 */
export const resolveEnsName = async (address: string, web3?: Web3) => {
  const currentProvider = web3 ? web3.currentProvider : window.web3?.currentProvider

  if (currentProvider && address) {
    const web3 = new Web3(currentProvider)
    const name = await web3.eth.ens.getAddress(address)
    return name
  }

  return undefined
}

/**
 * Get the network name from the id
 * @param networkId Id of the networks
 */
export const getNetworkName = (networkId: number|string|undefined) => {
  if (!networkId) return ""

  switch (+networkId) {
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

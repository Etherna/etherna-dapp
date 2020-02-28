// fix SSR building issues
const Web3Connect = typeof window !== "undefined" ? require("web3connect").default : null
const WalletConnectProvider = typeof window !== "undefined" ? require("@walletconnect/web3-provider") : null
const Portis = typeof window !== "undefined" ? require("@portis/web3").default : null
const Fortmatic = typeof window !== "undefined" ? require("fortmatic") : null
const Authereum = typeof window !== "undefined" ? require("authereum") : null

export const web3Connect = Web3Connect ? new Web3Connect.Core({
    providerOptions: {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: process.env.INFURA_ID,
            },
        },
        portis: {
            package: Portis,
            options: {
                id: process.env.PORTIS_ID,
            },
        },
        fortmatic: {
            package: Fortmatic,
            options: {
                key: process.env.FORTMATIC_ID,
            },
        },
        authereum: {
            package: Authereum,
            options: {},
        },
    },
}) : {}

export const connectWallet = async wallet => {
    const normalizedWallet = wallet && wallet.toLowerCase()
    let provider
    switch (normalizedWallet) {
        case "metamask":
            provider = await web3Connect.connectTo("injected")
            break
        case "dapper":
            provider = await web3Connect.connectTo("injected")
            break
        case "fortmatic":
            provider = await web3Connect.connectTo("fortmatic")
            break
        case "portis":
            provider = await web3Connect.connectTo("portis")
            break
        case "walletconnect":
            provider = await web3Connect.connectTo("walletconnect")
            break
        case "authereum":
            provider = await web3Connect.connectTo("authereum")
            break
        default:
            provider = await web3Connect.ConnectToInjected()
            break
    }
    return provider
}

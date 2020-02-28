// fix SSR building issues
const Web3Connect = typeof window !== "undefined" ? require("web3connect").default : null
//const WalletConnectProvider = typeof window !== "undefined" ? require("@walletconnect/web3-provider").default : null
//const Authereum = typeof window !== "undefined" ? require("authereum").default : null

export const web3Connect = Web3Connect ? new Web3Connect.Core({
    providerOptions: {
        // FIXME: Wallets not working for this issue: https://github.com/3box/3box-js/issues/700

        // walletconnect: {
        //     package: WalletConnectProvider,
        //     options: {
        //         infuraId: process.env.INFURA_ID,
        //     },
        // },
        // authereum: {
        //     package: Authereum,
        //     options: {},
        // },
    },
}) : {}

export const connectWallet = async wallet => {
    const normalizedWallet = wallet && wallet.toLowerCase()
    let provider
    switch (normalizedWallet) {
        case "walletconnect":
            provider = await web3Connect.connectTo("walletconnect")
            break
        case "authereum":
            provider = await web3Connect.connectTo("authereum")
            break
        default:
            provider = await web3Connect.connectTo("injected")
            break
    }
    return provider
}

import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import Authereum from "authereum"

export const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: process.env.REACT_APP_INFURA_ID,
            },
        },
        authereum: {
            package: Authereum,
            options: {},
        },
    },
})

export const connectWallet = async wallet => {
    const normalizedWallet = wallet && wallet.toLowerCase()
    let provider
    switch (normalizedWallet) {
        case "walletconnect":
            provider = await web3Modal.connectTo("walletconnect")
            break
        case "authereum":
            provider = await web3Modal.connectTo("authereum")
            break
        default:
            provider = await web3Modal.connectTo("injected")
            break
    }
    return provider
}

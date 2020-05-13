import Web3 from "web3"
import { getProviderInfo } from "web3modal"

import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { UserActionTypes } from "@state/reducers/userReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { isBrowserCompatible } from "@utils/browser"
import { fetchAccounts } from "@utils/ethFuncs"
import { connectWallet, web3Modal } from "@utils/web3Modal"

const injectWeb3 = async () => {
    if (!isBrowserCompatible()) {
        store.dispatch({
            type: UIActionTypes.UI_TOGGLE_BROWSER_SUPPORT,
            showUnsupportedModal: true,
        })
    } else {
        const defaultWallet = window.localStorage.getItem("defaultWallet")
        if (defaultWallet) {
            await autoSelectWallet(defaultWallet)
        } else {
            await pickWallet()
        }
    }
}

const pickWallet = async () => {
    try {
        const provider = await web3Modal.connect()
        await connectProvider(provider)
    } catch (error) {
        console.error(error)
    }
}

const autoSelectWallet = async wallet => {
    if (wallet.toLowerCase() === "walletconnect") {
        await pickWallet() // walletconnect needs to scan qr code
        return
    }

    let provider = await connectWallet(wallet)
    await connectProvider(provider)
}

const connectProvider = async provider => {
    try {
        const { name, logo } = getProviderInfo(provider)
        if (name.toLowerCase() === "walletconnect")
            window.localStorage.removeItem("walletconnect")
        window.localStorage.setItem("defaultWallet", name)

        // Update state provider
        const web3 = new Web3(provider)
        store.dispatch({
            type: EnvActionTypes.ENV_UPDATE_PROVIDER,
            web3,
            currentWallet: name,
            currentWalletLogo: logo,
        })

        // Update user address
        const addresses = await fetchAccounts(web3)
        const currentAddress = addresses[0]
        store.dispatch({
            type: UserActionTypes.USER_UPDATE_ADDRESS,
            address: currentAddress,
        })
        store.dispatch({
            type: EnvActionTypes.ENV_CURRENT_ADDRESS,
            currentAddress,
        })

        // Update user signed in
        store.dispatch({
            type: UserActionTypes.USER_UPDATE_SIGNEDIN,
            isSignedIn: true,
        })
    } catch (error) {
        console.error(`Cannot connect provider: ${error.message}`)
        store.dispatch({
            type: UIActionTypes.UI_SHOW_ERROR,
            errorMessage: error.message,
            errorTitle: "Cannot connect provider",
        })
    }
}

export default injectWeb3

import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { UserActionTypes } from "@state/reducers/userReducer"
import { getIdentity } from "@utils/ethernaResources/identityResources"

/**
 * Fetch the current identity from the SSO server
 */
const fetchIdentity = async () => {
    try {
        const identity = await getIdentity()

        store.dispatch({
            type: UserActionTypes.USER_UPDATE_IDENTITY,
            address: identity.etherAddress,
            username: identity.username,
        })
        store.dispatch({
            type: UserActionTypes.USER_UPDATE_SIGNEDIN,
            isSignedIn: true
        })

        injectWallet("0x" + identity.etherManagedPrivateKey)

        return true
    } catch (error) {
        console.error(error)

        store.dispatch({
            type: UserActionTypes.USER_UPDATE_SIGNEDIN,
            isSignedIn: false
        })

        return false
    }
}

/**
 * Inject a new wallet instance in the store
 * @param {string} privateKey Wallet private key
 */
const injectWallet = privateKey => {
    if (!window.web3) {
        throw new Error("Coudn't find a web3 instance")
    }
    const wallet = window.web3.eth.accounts.privateKeyToAccount(privateKey)
    wallet.sign = data => {
        const sign = require("eth-lib").account.sign
        return sign(data, wallet.privateKey)
    }

    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_WALLET,
        wallet
    })
}


export default fetchIdentity
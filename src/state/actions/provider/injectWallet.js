import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

/**
 * Inject a minimal wallet in the store to sign feed digest
 * @param {string} privateKey Account private key
 */
export const injectWallet = privateKey => {
    const { web3 } = store.getState().env
    const wallet = web3.eth.accounts.privateKeyToAccount(privateKey)
    wallet.sign = function (data) {
        const sign = require("eth-lib").account.sign
        return sign(data, privateKey)
    }
    delete wallet.encrypt
    delete wallet.signTransaction
    delete wallet.privateKey

    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_WALLET,
        wallet
    })
}

/**
 * Remove injected wallet from the store
 */
export const clearWallet = () => {
    store.dispatch({
        type: EnvActionTypes.ENV_UPDATE_WALLET
    })
}
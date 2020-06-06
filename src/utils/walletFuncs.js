import { store } from "@state/store"

/**
 * Ask a user to sign a message with his wallet
 * @param {string} hash Hash of the message to sign
 * @param {boolean} normalize Seet to true to use 0-1 as recover version instead of 27-28 (default false)
 * @returns {string} The signature
 */
export const askToSignMessage = async (hash, normalize = false) => {
    const { web3, wallet } = store.getState().env

    if (!web3.currentProvider.selectedAddress && !wallet) {
        throw new Error("Coudn't find a web3 instance. Make sure you are signed in with etherna or MetaMask")
    }

    let sig = wallet.sign(hash)

    if (normalize) {
        let sigBytes = web3.utils.hexToBytes(sig)
        sigBytes[64] -= 27
        sig = web3.utils.bytesToHex(sigBytes)
    }

    return sig
}

// const requestSign = async (data, address) => {
//     // RPC signing
//     var params = [
//         data,
//         address
//     ]
//     var method = 'personal_sign'
//     const sig = await callRpc(window.ethereum, method, params, address)

//     return sig
// }

// const callRpc = async (provider, method, params, fromAddress) =>
//     safeSend(provider, encodeRpcCall(method, params, fromAddress))

// const safeSend = (provider, data) => {
//     const send = (Boolean(provider.sendAsync) ? provider.sendAsync : provider.send).bind(provider)
//     return new Promise((resolve, reject) => {
//         send(data, function(err, result) {
//             if (err) reject(err)
//             else if (result.error) reject(result.error)
//             else resolve(result.result)
//         })
//     })
// }

// const encodeRpcCall = (method, params, fromAddress) => ({
//     jsonrpc: '2.0',
//     id: 1,
//     method,
//     params,
//     fromAddress
// })

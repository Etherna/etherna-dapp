import web3 from "web3"

/**
 * Ask a user to sign a message with his wallet
 * @param {string} hash Hash of the message to sign
 * @param {boolean} normalize Seet to true to use 0-1 as recover version instead of 27-28 (default false)
 */
export const askToSignMessage = async (hash, normalize = false) => {
    if (!window.web3 || !window.web3.eth) {
        throw new Error("Coudn't find a web3 instance")
    }
    if (!window.web3.currentProvider.selectedAddress) {
        throw new Error("Coudn't find a default account. Unlock your wallet first.")
    }

    const from = await window.web3.eth.getCoinbase()

    //window.web3.eth.disableSignPrefix = true
    let sig = await requestSign(hash, window.web3.currentProvider.selectedAddress)
    // let sig = await window.web3.eth.sign(hash, window.web3.currentProvider.selectedAddress)
    //window.web3.eth.disableSignPrefix = false

    console.log(sig);
    console.log(window.web3.currentProvider.selectedAddress);
    console.log(window.web3.eth.accounts.recover(hash, sig));
    console.log(window.web3.eth.accounts.recover(hash, sig, true));

    return sig
}

const requestSign = async (data, address) => {
    if (!window.ethereum) {
        throw new Error("Cannot find ethereum instance")
    }

    if (window.ethereum.isAuthereum) {
        return window.ethereum.signMessageWithSigningKey(data)
    }

    var params = [
        data,
        address
    ]
    var method = 'personal_sign'
    const res = await callRpc(window.ethereum, method, params, address)

    return res
}

const callRpc = async (provider, method, params, fromAddress) =>
    safeSend(provider, encodeRpcCall(method, params, fromAddress))

const safeSend = (provider, data) => {
    const send = (Boolean(provider.sendAsync) ? provider.sendAsync : provider.send).bind(provider)
    return new Promise((resolve, reject) => {
        send(data, function(err, result) {
            if (err) reject(err)
            else if (result.error) reject(result.error)
            else resolve(result.result)
        })
    })
}

const encodeRpcCall = (method, params, fromAddress) => ({
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
    fromAddress
})

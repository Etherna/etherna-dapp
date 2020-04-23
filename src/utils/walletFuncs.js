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

    let sig = await window.web3.eth.personal.sign(hash, window.web3.currentProvider.selectedAddress)

    if (normalize) {
        let sigBytes = web3.utils.hexToBytes(sig)
        sigBytes[64] -= 27
        sig = web3.utils.bytesToHex(sigBytes)
    }

    return sig
}

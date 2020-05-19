import axios from "axios"

// ----------------------------------------------------------------------------
// GET

/**
 * Get the identity of the current user
 *
 * @typedef {Object} Identity
 * @property {string} email Email used for recovery
 * @property {string} etherAddress Profile eth address
 * @property {string} etherManagedPrivateKey Profile eth address private key
 * @property {string} etherLoginAddress Wallet address for login
 * @property {string} phoneNumber User's phone number
 * @property {string} username User's username
 *
 * @returns {Identity}
 */
export const getIdentity = async () => {
    return {"email":null,"etherAddress":"0x911bd3158c1F2AC9Af3475EDC54dB2Eb07fEe66F","etherManagedPrivateKey":"366839af22b563b96bc980c89d5a78f46c083df73bfd9ac04b6cc8be587d8a35","etherLoginAddress":null,"phoneNumber":null,"username":"mattia"}
    const apiUrl = `${process.env.REACT_APP_SSO_HOST}/api/v0.1/identity`

    const resp = await axios.get(apiUrl, {
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        withCredentials: true
    })
    const data = resp.data

    return data
}

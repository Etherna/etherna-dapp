import http from "@utils/request"

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
    const apiUrl = `${process.env.REACT_APP_SSO_HOST}/api/v0.2/identity`

    const resp = await http.get(apiUrl, {
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        withCredentials: true
    })
    const data = resp.data

    return data
}

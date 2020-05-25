import blockies from "ethereum-blockies-base64"

/**
 * Get the blockies image of a address
 * @param {string} address Eth address
 */
const makeBlockies = address => {
    return blockies(address || "0x0")
}

export default makeBlockies

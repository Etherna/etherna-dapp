import blockies from "ethereum-blockies-base64"

const makeBlockies = (address) => {
    return blockies(address || "0x0")
}

export default makeBlockies
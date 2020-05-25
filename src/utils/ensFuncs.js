import axios from "axios"
import { ethers } from "ethers"

/**
 *
 * @param {web3} web3Obj Web3 instance
 * @param {string} address Address to fetch the ens
 * @param {boolean} isGetAllNames Wheather to returns an array with all the ens
 * @returns {string|array|null}
 */
export const fetchEns = async (web3Obj, address, isGetAllNames) => {
    try {
        const currentProvider = web3Obj
            ? web3Obj.currentProvider
            : window.web3 && window.web3.currentProvider

        // this looks for the canonical ENS name
        if (currentProvider) {
            const provider = new ethers.providers.Web3Provider(currentProvider)
            const name = await provider.lookupAddress(address)
            if (name) return name
        }

        const ensDomainRequest = {
            query: ` {
                domains(where:{ owner: "${address}" }) {
                    name
                }
            }`,
        }

        const resp = await axios.post(
            "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
            JSON.stringify(ensDomainRequest), {
                headers: {
                    "Content-Type": "application/json"
                },
            }
        )

        if (resp.status !== 200 && resp.status !== 201) {
            throw new Error(`Failed to fetch ENS for: ${address}`, resp)
        }

        const { data, errors } = resp.data

        if (data.domains.length && !isGetAllNames) return data.domains[0].name
        if (data.domains.length && isGetAllNames) return data.domains
        if (errors) return errors
        return null
    } catch (error) {
        console.error("ENS Request error:", error)
    }
}

/**
 * Check if a string is a valid ens address
 * @param {string} address Ens name value
 * @returns {boolean}
 */
export const checkIsENSAddress = address => {
    const noSpace = /^\S*$/.test(address)
    if (!noSpace) return false

    const isENSAddress = /([a-z0-9-]){3,}\.(eth)/i.test(address)
    return isENSAddress
}

/**
 * Get the eth address from the ens
 * @param {string} name Ens name
 */
export const fetchEthAddrByENS = async name => {
    try {
        const ensDomainRequest = {
            query: `{
                domains(where: { name : "${name}" }) {
                    owner {
                        id
                    }
                }
            }`
        }

        const resp = await axios.post(
            "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
            JSON.stringify(ensDomainRequest), {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )

        if (resp.status !== 200 && resp.status !== 201) {
            throw new Error(`Failed to get the eth address for: ${name}`, resp)
        }

        const { data, errors } = resp.data

        if (data) return data.domains[0] && data.domains[0].owner.id

        return errors
    } catch (error) {
        console.error("ENS Request error:", error)
    }
}

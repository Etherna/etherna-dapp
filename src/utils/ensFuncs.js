import { ethers } from "ethers"

export const fetchEns = async (web3Obj, address, isGetAllNames) => {
    try {
        const currentProvider = web3Obj
            ? web3Obj.currentProvider
            : web3 && web3.currentProvider // eslint-disable-line

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

        const res = await fetch(
            "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
            {
                method: "POST",
                body: JSON.stringify(ensDomainRequest),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )

        if (res.status !== 200 && res.status !== 201)
            throw new Error("Failed", res)

        const { data, errors } = await res.json()

        if (data.domains.length && !isGetAllNames) return data.domains[0].name
        if (data.domains.length && isGetAllNames) return data.domains
        if (errors) return errors
        return null
    } catch (error) {
        console.error("ensRequest", error)
    }
}

export const checkIsENSAddress = string => {
    const noSpace = /^\S*$/.test(string)
    if (!noSpace) return false

    const isENSAddress = /([a-z0-9-]){3,}\.(eth)/i.test(string)
    return isENSAddress
}

export const fetchEthAddrByENS = async name => {
    try {
        const ensDomainRequest = {
            query: `{
                domains(where: { name : "${name}" }) {
                    owner {
                    id
                    }
                }
            }`,
        }

        const res = await fetch(
            "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
            {
                method: "POST",
                body: JSON.stringify(ensDomainRequest),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )

        if (res.status !== 200 && res.status !== 201)
            throw new Error("Failed", res)

        const { data, errors } = await res.json()
        if (data) return data.domains[0] && data.domains[0].owner.id

        return errors
    } catch (error) {
        console.error("ENS Request error:", error)
    }
}

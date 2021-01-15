import { ethers } from "ethers"
import { AsyncSendable } from "ethers/providers"
import Web3 from "web3"

import http from "@utils/request"
import { WindowWeb3 } from "typings/window"

type EnsResp = {
  data: {
    domains: {
      name: string
      owner: {
        id: string
      }
    }[]
  }
  errors: string[]
}

/**
 * Get the ENS name of an address
 * @param web3Obj Web3 instance
 * @param address Address to fetch the ens
 * @param isGetAllNames Wheather to returns an array with all the ens
 */
export const fetchEns = async (web3Obj: Web3, address: string, isGetAllNames: boolean) => {
  try {
    const windowWeb3: WindowWeb3 = window

    const currentProvider = web3Obj
      ? web3Obj.currentProvider as AsyncSendable
      : windowWeb3.web3?.currentProvider as AsyncSendable

    // this looks for the canonical ENS name
    if (currentProvider) {
      const provider = new ethers.providers.Web3Provider(currentProvider)
      const name = await provider.lookupAddress(address)
      if (name) return name
    }

    const ensDomainRequest = {
      query: `{
        domains(where:{ owner: "${address}" }) {
          name
        }
      }`,
    }

    const resp = await http.post<EnsResp>(
      "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
      JSON.stringify(ensDomainRequest),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (resp.status !== 200 && resp.status !== 201) {
      throw new Error(`Failed to fetch ENS for: ${address}`)
    }

    const { data, errors } = resp.data

    if (data.domains.length && !isGetAllNames) return data.domains[0].name
    if (data.domains.length && isGetAllNames) return data.domains
    if (errors) return errors
    return null
  } catch (error) {
    console.error("ENS Request error:", error)
    return null
  }
}

/**
 * Check if a string is a valid ens address
 * @param address Ens name value
 */
export const checkIsENSAddress = (address: string) => {
  const noSpace = /^\S*$/.test(address)
  if (!noSpace) return false

  const isENSAddress = /([a-z0-9-]){3,}\.(eth)/i.test(address)
  return isENSAddress
}

/**
 * Get the eth address from the ens
 * @param name Ens name
 */
export const fetchEthAddrByENS = async (name: string) => {
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

    const resp = await http.post<EnsResp>(
      "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
      JSON.stringify(ensDomainRequest),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (resp.status !== 200 && resp.status !== 201) {
      throw new Error(`Failed to get the eth address for: ${name}`)
    }

    const { data, errors } = resp.data

    if (data) return data.domains[0] && data.domains[0].owner.id

    return errors
  } catch (error) {
    console.error("ENS Request error:", error)
    return null
  }
}

import axios from "axios"

import { store } from "@state/store"

// ----------------------------------------------------------------------------
// GET

/**
 * Get etherna settings
 *
 * @typedef {object} Settings
 * @property {string} defaultSwarmGatewayUrl
 *
 * @returns {Settings}
 */
export const getSettings = async () => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/system/settings`

    const resp = await axios.get(apiUrl)

    return resp.data
}

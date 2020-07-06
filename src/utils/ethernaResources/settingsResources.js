import { store } from "@state/store"
import http from "@utils/request"

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

    const resp = await http.get(apiUrl)

    return resp.data
}

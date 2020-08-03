import http from "@utils/request"
import apiPath from "./apiPath"

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
    const path = apiPath()
    const apiUrl = `${path}/system/settings`

    const resp = await http.get(apiUrl)

    return resp.data
}

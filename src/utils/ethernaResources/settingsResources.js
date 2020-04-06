import axios from "axios"

import { store } from "state/store"

// ----------------------------------------------------------------------------
// GET

export const getSettings = async () => {
    const { indexHost } = store.getState().env
    const apiUrl = `${indexHost}/system/settings`

    const resp = await axios.get(apiUrl)

    /**
     * Object:
     * {
     *   defaultSwarmGatewayUrl: string,
     * }
     */
    return resp.data
}

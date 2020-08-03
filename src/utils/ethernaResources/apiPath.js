const { store } = require("@state/store")

const apiPath = () => {
    const { indexHost, indexApiVersion } = store.getState().env
    const versionPath = indexApiVersion && indexApiVersion !== ""
        ? `/api/v${indexApiVersion}`
        : ``
    const path = `${indexHost}${versionPath}`
    return path
}

export default apiPath
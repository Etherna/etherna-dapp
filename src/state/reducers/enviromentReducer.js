export const EnvActionTypes = {
    ENV_UPDATE_PROVIDER: "ENV_UPDATE_PROVIDER",
    ENV_UPDATE_NETWORK: "ENV_UPDATE_NETWORK",
    ENV_CURRENT_ADDRESS: "ENV_CURRENT_ADDRESS",
    ENV_IS_MOBILE: "ENV_IS_MOBILE",
    ENV_UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
    ENV_UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
}

const initialState = {
    indexHost:
        (typeof(window) !== "undefined" && window.localStorage.getItem("indexHost")) ||
        process.env.INDEX_HOST ||
        "localhost",
    gatewayHost:
        (typeof(window) !== "undefined" && window.localStorage.getItem("gatewayHost")) ||
        process.env.GATEWAY_HOST ||
        "https://swarm-gateways.net"
}

const enviromentReducer = (state = initialState, action) => {
    switch (action.type) {
        case EnvActionTypes.ENV_UPDATE_PROVIDER:
            return {
                ...state,
                web3: action.web3,
                currentWallet: action.currentWallet,
                currentWalletLogo: action.currentWalletLogo,
            }

        case EnvActionTypes.ENV_UPDATE_NETWORK:
            return {
                ...state,
                network: action.network,
            }

        case EnvActionTypes.ENV_CURRENT_ADDRESS:
            return {
                ...state,
                currentAddress: action.currentAddress,
                previusAddress: action.previusAddress,
            }

        case EnvActionTypes.ENV_IS_MOBILE:
            return {
                ...state,
                isMobile: action.isMobile,
            }

        case EnvActionTypes.ENV_UPDATE_INDEXHOST:
            return {
                ...state,
                indexHost: action.indexHost,
            }

        case EnvActionTypes.ENV_UPDATE_GATEWAY_HOST:
            return {
                ...state,
                gatewayHost: action.gatewayHost,
            }

        default:
            return state
    }
}

export default enviromentReducer

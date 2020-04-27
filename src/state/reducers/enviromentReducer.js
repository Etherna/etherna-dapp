import { defaultKeymap } from "@keyboard"
import lang from "@lang"

export const EnvActionTypes = {
    ENV_UPDATE_PROVIDER: "ENV_UPDATE_PROVIDER",
    ENV_UPDATE_NETWORK: "ENV_UPDATE_NETWORK",
    ENV_CURRENT_ADDRESS: "ENV_CURRENT_ADDRESS",
    ENV_IS_MOBILE: "ENV_IS_MOBILE",
    ENV_UPDATE_INDEXHOST: "ENV_UPDATE_INDEXHOST",
    ENV_UPDATE_GATEWAY_HOST: "ENV_UPDATE_GATEWAY_HOST",
    UPDATE_KEYMAP: "UPDATE_KEYMAP",
    EDIT_SHORTCUT: "EDIT_SHORTCUT",
}

const initialState = {
    indexHost:
        window.localStorage.getItem("indexHost") ||
        process.env.REACT_APP_INDEX_HOST ||
        "localhost",
    gatewayHost:
        window.localStorage.getItem("gatewayHost") ||
        process.env.REACT_APP_GATEWAY_HOST ||
        "https://swarm-gateways.net",
    keymap: defaultKeymap,
    lang
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

        case EnvActionTypes.UPDATE_KEYMAP:
            return {
                ...state,
                keymap: action.keymap,
            }

        case EnvActionTypes.EDIT_SHORTCUT:
            return {
                ...state,
                shortcutNamespace: action.shortcutNamespace,
                shortcutKey: action.shortcutKey,
            }

        default:
            return state
    }
}

export default enviromentReducer
